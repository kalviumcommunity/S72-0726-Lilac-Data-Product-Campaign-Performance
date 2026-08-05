import json
from pathlib import Path

notebook = {
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Campaign Performance & Activation Intelligence EDA\n",
    "\n",
    "Welcome to the interactive Exploratory Data Analysis (EDA) notebook. Unlike the `.py` script which generates a single dashboard image, this notebook allows you to run analysis cell-by-cell, inspect dataframes, and view charts inline."
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 1. Load Dependencies & Data"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "import pandas as pd\n",
    "import matplotlib.pyplot as plt\n",
    "import matplotlib.ticker as mticker\n",
    "import numpy as np\n",
    "\n",
    "# Set dark theme for inline plots\n",
    "plt.style.use('dark_background')\n",
    "\n",
    "# Load the dataset\n",
    "df = pd.read_csv('../marketing_and_product_performance.csv')\n",
    "\n",
    "print(f\"Dataset loaded with {df.shape[0]:,} rows and {df.shape[1]} columns.\")\n",
    "display(df.head())"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 2. ROI Distribution\n",
    "Let's look at how the Return on Investment is distributed across all campaigns."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "plt.figure(figsize=(10, 5))\n",
    "roi = df[\"ROI\"].dropna()\n",
    "plt.hist(roi, bins=50, color=\"#7c4dff\", alpha=0.85, edgecolor=\"none\")\n",
    "\n",
    "median_roi = roi.median()\n",
    "plt.axvline(median_roi, color=\"#ff4081\", linewidth=2, linestyle=\"--\", label=f\"Median ROI: {median_roi:.2f}\")\n",
    "\n",
    "plt.title(\"ROI Distribution\", fontsize=14, fontweight=\"bold\")\n",
    "plt.xlabel(\"ROI\")\n",
    "plt.ylabel(\"Frequency\")\n",
    "plt.legend()\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 3. Conversions by Subscription Tier\n",
    "How do conversions differ between Basic, Premium, and Standard users?"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "plt.figure(figsize=(10, 6))\n",
    "tiers = sorted(df[\"Subscription_Tier\"].dropna().unique())\n",
    "tier_data = [df.loc[df[\"Subscription_Tier\"] == t, \"Conversions\"].dropna() for t in tiers]\n",
    "\n",
    "bp = plt.boxplot(tier_data, tick_labels=tiers, patch_artist=True, notch=True)\n",
    "\n",
    "colors = ['#7c4dff', '#00e5ff', '#76ff03']\n",
    "for patch, color in zip(bp['boxes'], colors):\n",
    "    patch.set_facecolor(color)\n",
    "    patch.set_alpha(0.7)\n",
    "\n",
    "plt.title(\"Conversions by Subscription Tier\", fontsize=14, fontweight=\"bold\")\n",
    "plt.ylabel(\"Conversions\")\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 4. Top Performing Keywords\n",
    "What keywords are associated with the most campaigns?"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "plt.figure(figsize=(10, 6))\n",
    "kw_counts = df[\"Common_Keywords\"].value_counts().head(10).sort_values()\n",
    "\n",
    "bars = plt.barh(kw_counts.index, kw_counts.values, color=\"#00e5ff\", edgecolor=\"none\", height=0.65)\n",
    "\n",
    "for bar, val in zip(bars, kw_counts.values):\n",
    "    plt.text(val + kw_counts.max() * 0.01, bar.get_y() + bar.get_height() / 2, \n",
    "             f\"{val:,}\", va=\"center\", fontsize=10, color=\"white\")\n",
    "\n",
    "plt.title(\"Top Campaign Keywords\", fontsize=14, fontweight=\"bold\")\n",
    "plt.xlabel(\"Count\")\n",
    "plt.show()"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "name": "python",
   "version": "3.11"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}

with open(Path(__file__).parent / "campaign_eda.ipynb", "w", encoding="utf-8") as f:
    json.dump(notebook, f, indent=1)
