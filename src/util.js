const CELL_SPACING = 16;

const pointToCoord = point => {
    return {
        x: Math.max(Math.round((point.x - CELL_SPACING / 2) / CELL_SPACING), 0),
        y: Math.max(Math.round((point.y - CELL_SPACING / 2) / CELL_SPACING), 0),
    }
}

const snapToCellCenter = point => {
    const coord = pointToCoord(point);
    return {
        x: coord.x * CELL_SPACING + CELL_SPACING / 2,
        y: coord.y * CELL_SPACING + CELL_SPACING / 2,
    }
}

export default {
    CELL_SPACING,
    PointToCoord: pointToCoord,
    SnapToCellCenter: snapToCellCenter
}