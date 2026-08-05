"""
Campaign Performance & Activation Intelligence – Matplotlib Visualisation
==========================================================================
Generates a 2×3 dashboard of charts from marketing_and_product_performance.csv.
"""

import matplotlib
matplotlib.use("Agg")
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
from pathlib import Path

# ── Load data ────────────────────────────────────────────────────────────────
DATA_PATH = Path(__file__).resolve().parent.parent / "marketing_and_product_performance.csv"
df = pd.read_csv(DATA_PATH)

# ── Theme / colour palette ───────────────────────────────────────────────────
BG       = "#0f0f1a"
PANEL    = "#16162a"
GRID     = "#2a2a4a"
TEXT     = "#e0e0f0"
ACCENT   = ["#7c4dff", "#00e5ff", "#ff4081", "#76ff03", "#ffab40", "#40c4ff"]

plt.rcParams.update({
    "figure.facecolor":  BG,
    "axes.facecolor":    PANEL,
    "axes.edgecolor":    GRID,
    "axes.labelcolor":   TEXT,
    "axes.grid":         True,
    "grid.color":        GRID,
    "grid.alpha":        0.4,
    "xtick.color":       TEXT,
    "ytick.color":       TEXT,
    "text.color":        TEXT,
    "font.family":       "sans-serif",
    "font.size":         10,
})

fig, axes = plt.subplots(2, 3, figsize=(20, 12))
fig.suptitle("Campaign Performance Dashboard", fontsize=22, fontweight="bold",
             color=TEXT, y=0.98)

# ── 1. ROI Distribution (Histogram + KDE-style) ─────────────────────────────
ax = axes[0, 0]
roi = df["ROI"].dropna()
ax.hist(roi, bins=50, color=ACCENT[0], alpha=0.85, edgecolor="none")
median_roi = roi.median()
ax.axvline(median_roi, color=ACCENT[2], linewidth=2, linestyle="--",
           label=f"Median ROI: {median_roi:.2f}")
ax.set_title("ROI Distribution", fontsize=14, fontweight="bold")
ax.set_xlabel("ROI")
ax.set_ylabel("Frequency")
ax.legend(fontsize=9, facecolor=PANEL, edgecolor=GRID, labelcolor=TEXT)

# ── 2. Budget vs Revenue (Scatter) ──────────────────────────────────────────
ax = axes[0, 1]
sample = df.sample(n=min(2000, len(df)), random_state=42)
scatter = ax.scatter(
    sample["Budget"], sample["Revenue_Generated"],
    c=sample["ROI"], cmap="cool", s=18, alpha=0.7, edgecolors="none"
)
cbar = fig.colorbar(scatter, ax=ax, pad=0.02)
cbar.set_label("ROI", color=TEXT, fontsize=10)
cbar.ax.yaxis.set_tick_params(color=TEXT)
plt.setp(cbar.ax.yaxis.get_ticklabels(), color=TEXT)
ax.set_title("Budget vs Revenue Generated", fontsize=14, fontweight="bold")
ax.set_xlabel("Budget ($)")
ax.set_ylabel("Revenue ($)")
ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x/1000:.0f}K"))
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x/1000:.0f}K"))

# ── 3. Conversions by Subscription Tier (Box plot) ──────────────────────────
ax = axes[0, 2]
tiers = sorted(df["Subscription_Tier"].dropna().unique())
tier_data = [df.loc[df["Subscription_Tier"] == t, "Conversions"].dropna() for t in tiers]
bp = ax.boxplot(tier_data, tick_labels=tiers, patch_artist=True, notch=True,
                medianprops=dict(color=ACCENT[2], linewidth=2),
                whiskerprops=dict(color=TEXT, linewidth=1),
                capprops=dict(color=TEXT, linewidth=1),
                flierprops=dict(marker="o", markerfacecolor=ACCENT[4], markersize=3,
                                alpha=0.4, markeredgecolor="none"))
for patch, colour in zip(bp["boxes"], [ACCENT[0], ACCENT[1], ACCENT[3]]):
    patch.set_facecolor(colour)
    patch.set_alpha(0.7)
ax.set_title("Conversions by Subscription Tier", fontsize=14, fontweight="bold")
ax.set_ylabel("Conversions")

# ── 4. Top Keywords – Horizontal Bar ────────────────────────────────────────
ax = axes[1, 0]
kw_counts = df["Common_Keywords"].value_counts().head(10).sort_values()
bars = ax.barh(kw_counts.index, kw_counts.values, color=ACCENT[1], edgecolor="none",
               height=0.65)
for bar, val in zip(bars, kw_counts.values):
    ax.text(val + kw_counts.max() * 0.01, bar.get_y() + bar.get_height() / 2,
            f"{val:,}", va="center", fontsize=9, color=TEXT)
ax.set_title("Top Campaign Keywords", fontsize=14, fontweight="bold")
ax.set_xlabel("Count")

# ── 5. Discount Level vs Units Sold (Binned bar chart) ──────────────────────
ax = axes[1, 1]
bins = [0, 10, 20, 30, 40, 50]
bin_labels = ["1-10%", "11-20%", "21-30%", "31-40%", "41-50%"]
df["Discount_Bin"] = pd.cut(df["Discount_Level"], bins=bins, labels=bin_labels)
disc_stats = df.groupby("Discount_Bin", observed=True)["Units_Sold"].agg(["mean", "std"])

bar_colors = [ACCENT[0], ACCENT[1], ACCENT[3], ACCENT[4], ACCENT[5]]
bars = ax.bar(disc_stats.index, disc_stats["mean"], color=bar_colors,
              edgecolor="none", width=0.6, alpha=0.85)
ax.errorbar(disc_stats.index, disc_stats["mean"], yerr=disc_stats["std"],
            fmt="none", ecolor=TEXT, elinewidth=1, capsize=4, alpha=0.5)
for bar, val in zip(bars, disc_stats["mean"]):
    ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 3,
            f"{val:.0f}", ha="center", va="bottom", fontsize=9, color=TEXT)
ax.set_title("Avg Units Sold by Discount Range", fontsize=14, fontweight="bold")
ax.set_xlabel("Discount Range")
ax.set_ylabel("Avg Units Sold")

# ── 6. Customer Satisfaction Score Distribution (Donut) ─────────────────────
ax = axes[1, 2]
sat_counts = df["Customer_Satisfaction_Post_Refund"].value_counts().sort_index()
labels = [f"Score {s}" for s in sat_counts.index]
colours = [ACCENT[i % len(ACCENT)] for i in range(len(sat_counts))]
wedges, texts, autotexts = ax.pie(
    sat_counts.values, labels=labels, colors=colours,
    autopct="%1.1f%%", pctdistance=0.78, startangle=140,
    wedgeprops=dict(width=0.45, edgecolor=BG, linewidth=2),
    textprops=dict(color=TEXT, fontsize=9),
)
for at in autotexts:
    at.set_fontsize(8)
    at.set_color(TEXT)
ax.set_title("Customer Satisfaction Distribution", fontsize=14, fontweight="bold")

# ── Final layout ─────────────────────────────────────────────────────────────
fig.tight_layout(rect=[0, 0, 1, 0.95])
plt.savefig(
    Path(__file__).resolve().parent / "campaign_dashboard.png",
    dpi=180, bbox_inches="tight", facecolor=BG
)
plt.show()  # Uncomment for interactive viewing
print("[OK] Dashboard saved to notebooks/campaign_dashboard.png")
