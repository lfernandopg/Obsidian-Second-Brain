---
fileClass: resource
type: 🧭 Guide
referenceStatus: 🟢 Reviewed
source: "[[Local Machine]]"
location: 📝 Obsidian Note
author: "[[Luis Fernando Peña (Me)]]"
tags:
url:
areas:
projects:
tasks:
resources:
aliases:
createdDate: Oct 13, 2025 - 11:03
modifiedDate: Oct 13, 2025 - 11:06
favorite: false
archived: false
---
## PROMPT

Como puedo realizar este indicador VMC_Cipher_B_Divergences de tradingview en python con sus configuraciones?

El cual se base en esto:

Oscillator Package

Market Cipher B is an all-in-one oscillator allowing for more quality indications than ever before. It combines five algorithms (some well-known, some custom) that have all been fine-tuned and smoothed for optimal analysis and trading results. When all of the algorithms converge, Market Cipher B will project a “Green Dot” which will aid you in longing the dips in bull markets as well as temporarily exiting shorts in bear markets. The Green Dot is often accompanied by extreme sellers’ momentum and will warn you of potential market bottoms, giving you strong hands even when the night is at its darkest.

Market Cipher B certainly excels on the small timeframes, but is a particularly deadly tool for isolating large swings in the market.

Esta es la configuracion que uso en tradingview
### WAVETREND SETTINGS

Show WaveTrend: true
Show Buy dots: true
Show Gold dots: true
Show Sell dots: true
Show Div. dots: true
Show Fast WT: false
WT Channel Length: 9
WT Average Length: 12
WT MA Source: (H + L + C)/3
WT MA Length: 3
WT Overbought Level 1: 53
WT Overbought Level 2: 60
WT Overbought Level 3: 100
WT Oversold Level 1: -53
WT Oversold Level 2: -60
WT Oversold Level 3: -75
Show WT Regular Divergences: true
Show WT Hidden Divergences: true
Not apply OB/OS Limits on Hidden Divergences: false
WT Bearish Divergence min: 45
WT Bullish Divergence min: -65
Show 2nd WT Regular Divergences: true
WT 2nd Bearish Divergence: 15
WT 2nd Bullish Divergence 15 min: -40

### MFI SETTINGS

MFI Period: 60
MFI Area multiplier: 600
MFI Area Y Pos: 2.5

### RSI SETTINGS

RSI Source: Close
RSI Length: 14
RSI Oversold: 30
RSI Overbought: 60
Show RSI Regular Divergences: true
Show RSI Hidden Divergences: true
RSI Bearish Divergence min: 60
RSI Bullish Divergence min: 30

### STOCH SETTINGS

Show Stochastic RSI: false
Use Log?: false
Use Average of both K & D: false
Stochastic RSI Source: close
Stochastic RSI Length: 14
RSI Length: 14
Stochastic RSI K Smooth: 3
Stochastic RSI D Smooth: 3
Show Stoch Regular Divergences: false
Show Stoch Hidden Divergences: false

### SCHAFF SETTINGS

Show Schaff TC line: false
Schaff TC Source: close
Schaff TC: 10
Schaff TC Fast Lenght: 23
Schaff TC Slow Lenght: 50
Schaff TC Factor: 0.5

### SOMMI SETTINGS

Show Sommi Flag: false
Show Sommi F. Wave: false
Sommi F. Wave timeframe: 720
F. Wave Bear Level (less than): 0
F. Wave Bull Level (more than): 0
WT Bear Level (more than): 0
WT Bull Level (less than): 0
Money flow Bear Level (less than): 0
Money flow Bull Level (more than): 0
Show Sommi diamond: false
HTF Candle Res. 1: 60
HTF Candle Res. 2: 240
WT Bear Level (More than): 0
WT Bull Level (Less than): 0

### MACD SETTINGS
Show MACD Colors: false
MACD Colors MACD TF: 240