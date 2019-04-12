import React, { Component } from 'react';
import paper from 'paper';

import Util from './util';
import Grid from './paper-gen';
import ToolGen from './tool-gen';

const CELL_SPACING = 16;

const snapToCellCenter = point => {
    const coord = Util.PointToCoord(point);
    return {
        x: coord.x * CELL_SPACING + CELL_SPACING / 2,
        y: coord.y * CELL_SPACING + CELL_SPACING / 2,
    }
}

class PaperView extends Component {
    constructor() {
        super();
        this.canvasRef = React.createRef();
        this.paperTools = new Map();

        this.state = {
            focusCell: null,
            activeTool: 'default',
            hoverObj: false
        }

        this.buildings = null;
        this.selectedObj = null;
    }

    componentDidMount() {
        paper.setup(this.canvasRef.current);
        Grid(paper.view.bounds, CELL_SPACING);

        this.buildings = new paper.Group({ selected: true });

        const baseTool = ToolGen.BaseTool(paper, this.canvasRef);
        baseTool.onKeyUp = ev => {
            if (ev.key === 'delete' && this.selectedObj)
                this.selectedObj.remove();
        }
        this.paperTools.set('default', baseTool);

        const beltTool = new paper.Tool();
        beltTool.onMouseMove = ev => {
            this.setState({ focusCell: Util.PointToCoord(ev.point) });
            this.drawFocussedCell();
        }

        beltTool.onMouseDrag = this.drawBuildingBelt;
        
        this.escapeTool(beltTool);

        this.paperTools.set('belt', beltTool);

        const structureTool = new paper.Tool();
        structureTool.onMouseMove = ev => {
            this.setState({ focusCell: Util.PointToCoord(ev.point) });
            this.drawFocussedCell(2, 3);
        }
        this.escapeTool(structureTool);

        structureTool.onMouseUp = ev => {
            this.drawStructure(2);
        }

        this.paperTools.set('structure', structureTool);

        const inserterTool = new paper.Tool();
        inserterTool.onMouseMove = this.drawBuildingInserter;
    }

    drawFocussedCell(x = 1, y = 1) {
        const cell = new paper.Path.Rectangle({
            from: [(this.state.focusCell.x) * CELL_SPACING, (this.state.focusCell.y) * CELL_SPACING],
            to: [(this.state.focusCell.x + x) * CELL_SPACING, (this.state.focusCell.y + y) * CELL_SPACING],
            fillColor: '#0f9',
            strokeColor: 'black',
            dashArray: [2, 2],
            opacity: 0.5
        });

        if (this.buildings.intersects(cell)) cell.fillColor = 'red';

        cell.removeOnMove();
    }

    drawBuildingBelt = (ev) => {
        const snappedDownPoint = Util.SnapToCellCenter(ev.downPoint);
        const snappedPoint = Util.SnapToCellCenter(ev.point);

        if (snappedDownPoint.x === snappedPoint.x && snappedDownPoint.y === snappedPoint.y) return;

        const line = new paper.Path.Line({
            from: snappedDownPoint,
            to: snappedPoint,
            strokeColor: 'orange',
            strokeWidth: 4,
            dashArray: [0, CELL_SPACING * 0.2, CELL_SPACING * 0.6, CELL_SPACING * 0.2]
        });
        line.removeOnDrag();

        const dx = snappedPoint.x - snappedDownPoint.x;
        const dy = snappedPoint.y - snappedDownPoint.y;

        if (dx !== 0 || dy !== 0) {
            if (ev.modifiers.control)
            line.insert(1, [
                    snappedDownPoint.x + dx,
                    snappedDownPoint.y
                ]);
            else
            line.insert(1, [
                    snappedDownPoint.x,
                    snappedDownPoint.y + dy
                ]);
        }        

        const startNode = new paper.Path.Circle({
            center: snappedDownPoint,
            radius: 4,
            fillColor: 'orange',
        }).removeOnDrag();

        const endNode = new paper.Path.Circle({
            center: snappedPoint,
            radius: 4,
            fillColor: 'orange',
            // strokeColor: 'orange'
        }).removeOnDrag();

        new paper.Path.Rectangle({
            from: [snappedPoint.x - CELL_SPACING / 2, snappedPoint.y - CELL_SPACING / 2],
            to: [snappedPoint.x + CELL_SPACING / 2, snappedPoint.y + CELL_SPACING / 2],
            fillColor: 'orange',
            strokeColor: 'red',
            opacity: 0.75
        }).removeOnMove().removeOnDrag();

        const belt = new paper.Group([startNode, endNode, line]);
        belt.onMouseEnter = ev => this.setState({ hoverObj: true });
        belt.onMouseLeave = ev => this.setState({ hoverObj: false });
        
        this.selectable(belt);
    }

    drawBuildingInserter(ev) {
        
    }

    drawStructure(n) {
        const structure = new paper.Path.Rectangle({
            from: [(this.state.focusCell.x - n + 1) * CELL_SPACING, (this.state.focusCell.y - n + 1) * CELL_SPACING],
            to: [(this.state.focusCell.x + n) * CELL_SPACING, (this.state.focusCell.y + n) * CELL_SPACING],
            fillColor: '#39f',
        });

        structure.scale(0.9);

        if (this.buildings.intersects(structure)) {
            structure.remove();
        } else {
            this.buildings.addChild(structure);
        }
    }

    selectable = obj => {
        obj.onMouseDown = ev => {
            obj.selected = !obj.selected;            
        
            if (obj.selected) this.selectedObj = obj;
            else this.selectedObj = null;
            console.log(this.selectedObj);
        }
    }

    escapeTool = tool => {
        tool.onKeyUp = ev => {
            if (ev.key === 'escape') this.setTool('default');
        }
    }

    setTool = toolName => {
        if (this.paperTools.get(toolName)) {
            this.paperTools.get(toolName).activate();
            this.setState({ activeTool: toolName });
        }
    }

    clearObjs = () => {
        paper.project.activeLayer.removeChildren();
        this.buildings.removeChildren();
        Grid(paper.view.bounds, CELL_SPACING);
    }

    ToolButton = ({ toolName }) => <button
        className={this.state.activeTool === toolName ? "btn-active" : ""}
        onClick={ev => this.setTool(toolName)}>
        {toolName.charAt(0).toUpperCase() + toolName.slice(1)}
    </button>

    render() {
        let canvasClass = this.state.activeTool === 'default' ? "canvas-pan" : "";
        canvasClass += (this.state.hoverObj && this.state.activeTool === 'default' ? " canvas-hover" : "");

        return (
            <div>
                <div className="controls">
                    <this.ToolButton toolName="default" />
                    <this.ToolButton toolName="belt" />
                    <this.ToolButton toolName="structure" />
                    <this.ToolButton toolName="delete" />

                    <button onClick={ev => this.clearObjs()}>Clear All</button>
                </div>
                <canvas
                    ref={this.canvasRef}
                    className={canvasClass}
                    onKeyDown={this.keyDown}
                    tabIndex="0"></canvas>
                {
                    this.state.focusCell ?
                        <p>Focussed Cell: {this.state.focusCell.x}, {this.state.focusCell.y}</p> :
                        <span></span>
                }
            </div>
        );
    }
}

export default PaperView;