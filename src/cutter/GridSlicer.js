import $ from 'jquery';

class GridSlicer {
    constructor(spriteCanvas, spriteCanvasView) {
        this.spriteCanvas = spriteCanvas;
        this.spriteCanvasView = spriteCanvasView;
        this.rows = 1;
        this.cols = 1;
        this.isActive = false;
    }

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
    }

    slice(rows, cols) {
        if (!this.spriteCanvas.canvas) {
            return [];
        }

        const width = this.spriteCanvas.canvas.width;
        const height = this.spriteCanvas.canvas.height;
        const cellWidth = Math.floor(width / cols);
        const cellHeight = Math.floor(height / rows);

        const sprites = [];
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const rect = {
                    x: col * cellWidth,
                    y: row * cellHeight,
                    width: cellWidth,
                    height: cellHeight
                };
                sprites.push(rect);
            }
        }

        return sprites;
    }

    applyGrid(rows, cols) {
        const rects = this.slice(rows, cols);
        
        // Clear existing selections
        this.spriteCanvasView._unselectAllSprites();
        this.spriteCanvasView._selectedSprites = [];

        // Select all grid cells
        rects.forEach(rect => {
            const sprite = this.spriteCanvasView._selectSprite(rect, rect);
            this.spriteCanvasView._selectedSprites.push(sprite);
        });

        this.spriteCanvasView.trigger('selectedSpritesChange', this.spriteCanvasView._selectedSprites);
    }
}

export default GridSlicer;
