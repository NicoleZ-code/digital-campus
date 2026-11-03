function onlineRate(total, warnings) {
  if (!total || !warnings) return '100';
  return (((total - warnings) / total) * 100).toFixed(1);
}

export function getContextMetrics({
  level,
  building,
  floor,
  room,
  rooms,
  assets,
  buildings,
  alerts,
}) {
  if (level < 2) {
    const totalAssets = buildings.reduce((sum, item) => sum + item.assets, 0);
    return {
      energy: buildings.reduce((sum, item) => sum + item.energy, 0),
      assets: totalAssets,
      area: buildings.reduce((sum, item) => sum + item.area, 0),
      online: onlineRate(totalAssets, alerts.length),
    };
  }
  const buildingAlerts = alerts.filter((alert) => alert.buildingId === building.id);
  if (level === 2)
    return {
      energy: building.energy,
      assets: building.assets,
      area: building.area,
      online: onlineRate(building.assets, buildingAlerts.length),
    };
  if (level === 3) {
    const count = rooms.length * assets.length;
    return {
      energy: rooms.reduce((sum, item) => sum + item.energy, 0),
      assets: count,
      area: rooms.reduce((sum, item) => sum + item.area, 0),
      online: onlineRate(count, buildingAlerts.filter((alert) => alert.floor === floor).length),
    };
  }
  return {
    energy: room.energy,
    assets: assets.length,
    area: room.area,
    online: onlineRate(assets.length, assets.filter((asset) => asset.status === '告警').length),
  };
}
