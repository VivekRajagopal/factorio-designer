/**
 * tool-gen.js
 * Generates the paper tool objs
 */

import paper from 'paper';
import Util from './util';

const CS = Util.CS;

const BaseTool = (paperScope, canvasRef) => {
    const t = new paper.Tool();

    // Panning
    t.onMouseDrag = ev => {
        if (ev.downPoint)
            paperScope.view.center = paperScope.view.center.add(ev.downPoint.subtract(ev.point));
    }

    //Mouse wheel event handler
    canvasRef.current.onwheel =  ev => {
        const currScale = Math.abs(paperScope.view.scaling.x); //Previous zoom amount
        const newScale = (ev.deltaY < 0) ?
            (Math.min(currScale * 1.25, 4.0)) :
            (Math.max(currScale * 0.8, 0.25));

        ev.preventDefault();

        paperScope.view.scaling = [newScale, newScale];
    };

    return t;
}

/**
 * 
 * @param {paper obj} paperScope 
 * @param {Width of line in coordinate units} width 
 * @param {Lines style} style 
 * @param {Optional end nodes as PaperPath obj} endNodes 
 */
const LinearTool = (paperScope, width, style, endNodes = null) => {
    const t = new paper.Tool();

    t.onMouseDrag = ev => {
        const snappedDownPoint = Util.SnapToCellCenter(ev.downPoint);
        const snappedPoint = Util.SnapToCellCenter(ev.point);

        if (snappedDownPoint.x === snappedPoint.x && snappedDownPoint.y === snappedPoint.y) return;

        const line = new paper.Path.Line({
            from: snappedDownPoint,
            to: snappedPoint,
        });
        line.style = style;
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
        }).removeOnDrag();

        new paper.Path.Rectangle({
            from: [snappedPoint.x - CS / 2, snappedPoint.y - CS / 2],
            to: [snappedPoint.x + CS / 2, snappedPoint.y + CS / 2],
            fillColor: 'orange',
            strokeColor: 'red',
            opacity: 0.75
        }).removeOnMove().removeOnDrag();

        const belt = new paper.Group([startNode, endNode, line]);
        belt.onMouseEnter = ev => this.setState({ hoverObj: true });
        belt.onMouseLeave = ev => this.setState({ hoverObj: false });
        
        this.selectable(belt);
    }
}

const ToolGen = {
    BaseTool,
    LinearTool
}

export default ToolGen;