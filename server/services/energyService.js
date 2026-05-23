export const calculateEnergy = (appliances) => {
  let annualKWh = 0;

  appliances.forEach((item) => {
    const kWh = (item.power * item.hours * item.days * item.units) / 1000;

    annualKWh += kWh;
  });

  return {
    annualKWh,
    monthlyKWh: annualKWh / 12,
  };
};
