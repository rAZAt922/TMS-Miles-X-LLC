const mockDrivers = [
  { id: 1, name: 'John Doe', location: 'New York', status: 'Active' },
  { id: 2, name: 'Jane Smith', location: 'Los Angeles', status: 'Inactive' },
];

const mockDispatchers = [
  { id: 1, name: 'Alice Johnson', location: 'Chicago' },
  { id: 2, name: 'Bob Williams', location: 'Houston' },
];

const mockLoads = [
  { id: 101, origin: 'Seattle', destination: 'Miami', status: 'In Transit', revenue: 5000 },
  { id: 102, origin: 'Dallas', destination: 'New York', status: 'Delivered', revenue: 4500 },
];

const mockStatusData = [
  { name: 'Active', value: 400 },
  { name: 'Inactive', value: 300 },
  { name: 'Pending', value: 300 },
  { name: 'Completed', value: 200 },
];

const mockWeeklyData = [
  { date: 'Mon', loads: 20, revenue: 4000 },
  { date: 'Tue', loads: 25, revenue: 5000 },
  { date: 'Wed', loads: 30, revenue: 6000 },
  { date: 'Thu', loads: 28, revenue: 5500 },
  { date: 'Fri', loads: 35, revenue: 7000 },
];

const mockColors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export { mockDrivers, mockDispatchers, mockLoads, mockStatusData, mockWeeklyData, mockColors };