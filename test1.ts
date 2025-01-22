const leaderboardRanking = [
  {
    rank: 1,
    label: "Master",
    min: 650_000,
    max: Infinity,
    rate: 0.3,
  },
  {
    rank: 2,
    label: "Black Belt",
    min: 490_000,
    max: 649_999,
    rate: 0.26,
  },
  {
    rank: 3,
    label: "Red Belt",
    min: 350_000,
    max: 489_999,
    rate: 0.24,
  },
  {
    rank: 4,
    label: "Brown Belt",
    min: 250_000,
    max: 349_999,
    rate: 0.22,
  },
  {
    rank: 5,
    label: "Purple Belt",
    min: 175_000,
    max: 249_999,
    rate: 0.2,
  },
  {
    rank: 6,
    label: "Blue Belt",
    min: 115_000,
    max: 174_999,
    rate: 0.18,
  },
  {
    rank: 7,
    label: "Green Belt",
    min: 75_000,
    max: 114_999,
    rate: 0.16,
  },
  {
    rank: 8,
    label: "Orange Belt",
    min: 45_000,
    max: 74_999,
    rate: 0.14,
  },
  {
    rank: 9,
    label: "Yellow Belt",
    min: 24_000,
    max: 44_999,
    rate: 0.12,
  },
  {
    rank: 10,
    label: "White Belt",
    min: 0,
    max: 23_999,
    rate: 0.1,
  },
];
const calculateRankedCommissions = (usdcAmount: number, cpxAmount: number) => {
  // Process ranks in reverse order (highest to lowest)
  const ranks = [...leaderboardRanking].reverse();
  let total = usdcAmount;
  let usdRewards = 0;
  const percentages: { rank: number; percentage: number; rate: number }[] = [];

  for (const rank of ranks) {
    // Calculate the maximum amount that can be attributed to this rank
    const bracketMax = Math.min(rank.max - rank.min + 1, total);
    // Compute commission based on the rank's rate
    const commission = bracketMax * (rank.rate / 2);
    usdRewards += commission;
    // Track the percentage of the total contribution for this rank
    percentages.push({
      rank: rank.rank,
      percentage: bracketMax / usdcAmount,
      rate: rank.rate / 2,
    });

    // Deduct the processed amount from the remaining total
    total -= bracketMax;
  }
  // Calculate total CPX contribution
  // Calculate CPX rewards based on rank-specific percentages
  const cpxRewards = percentages.reduce(
    (acc, percentage) =>
      acc + percentage.percentage * cpxAmount * percentage.rate,
    0
  );
  // Return calculated USDT and CPX rewards
  return {
    usdt: usdRewards,
    cpx: isNaN(cpxRewards) ? 0 : cpxRewards,
  };
};

async function main() {
  const referralExample: { usdc: number; cpxAmount: number }[] = [
    { usdc: 101869, cpxAmount: 1000000000000000000000000 },
    { usdc: 246487.97, cpxAmount: 2369000000000000000000000 },
    { usdc: 502937.81, cpxAmount: 4844000000000000000000000 },
    { usdc: 465587.56, cpxAmount: 4517000000000000000000000 },
    { usdc: 39231.4, cpxAmount: 390000000000000000000000 },
    { usdc: 700000, cpxAmount: 500000000000000000000000 },
  ];
  for (const ref of referralExample) {
    console.log(
      JSON.stringify(calculateRankedCommissions(ref.usdc, ref.cpxAmount))
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
