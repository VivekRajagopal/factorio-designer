import paper from 'paper';

const Grid = (bounds, spacing, nMajor = 8) => {
    const grid = new paper.Group();

    for (let x = 0; x <= bounds.width; x += spacing) {
        grid.addChild(
            new paper.Path.Line({
                from: [x, 0],
                to: [x, bounds.height],
                strokeColor: x % (spacing * nMajor) === 0 ? '#777' : '#666',
                strokeWidth: x % (spacing * nMajor) === 0 ? 2 : 1,
                opacity: 0.5
            })
        )
    }

    for (let y = 0; y <= bounds.height; y += spacing) {
        grid.addChild(
            new paper.Path.Line({
                from: [0, y],
                to: [bounds.width, y],
                strokeColor: y % (spacing * nMajor) === 0 ? '#777' : '#666',
                strokeWidth: y % (spacing * nMajor) === 0 ? 2 : 1,
                opacity: 0.5
            })
        )
    }

    return grid;
}

export default Grid;