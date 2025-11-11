class AutoSlicer {
    constructor(spriteCanvas, spriteCanvasView) {
        this.spriteCanvas = spriteCanvas;
        this.spriteCanvasView = spriteCanvasView;
    }

    detectSprites() {
        if (!this.spriteCanvas.canvas) {
            return [];
        }

        const canvas = this.spriteCanvas.canvas;
        const context = canvas.getContext('2d');
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const visited = new Array(canvas.width * canvas.height).fill(false);
        const sprites = [];

        // Helper function to check if a pixel is background
        const isBackground = (x, y) => {
            if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
                return true;
            }
            const index = (y * canvas.width + x) * 4;
            const bg = this.spriteCanvas._bg;
            
            // Check if pixel matches background color
            return (
                imageData.data[index] === bg[0] &&
                imageData.data[index + 1] === bg[1] &&
                imageData.data[index + 2] === bg[2] &&
                imageData.data[index + 3] === bg[3]
            );
        };

        // Flood fill to find connected components
        const floodFill = (startX, startY) => {
            const queue = [[startX, startY]];
            let minX = startX, maxX = startX;
            let minY = startY, maxY = startY;

            while (queue.length > 0) {
                const [x, y] = queue.shift();
                const index = y * canvas.width + x;

                if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
                    continue;
                }
                if (visited[index] || isBackground(x, y)) {
                    continue;
                }

                visited[index] = true;
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);

                // Add neighbors to queue
                queue.push([x + 1, y]);
                queue.push([x - 1, y]);
                queue.push([x, y + 1]);
                queue.push([x, y - 1]);
            }

            return {
                x: minX,
                y: minY,
                width: maxX - minX + 1,
                height: maxY - minY + 1
            };
        };

        // Scan the image for sprites
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const index = y * canvas.width + x;
                if (!visited[index] && !isBackground(x, y)) {
                    const rect = floodFill(x, y);
                    // Only add sprites with reasonable dimensions
                    if (rect.width > 0 && rect.height > 0) {
                        sprites.push(rect);
                    }
                }
            }
        }

        return sprites;
    }

    selectAllSprites() {
        const rects = this.detectSprites();
        
        // Clear existing selections
        this.spriteCanvasView._unselectAllSprites();
        this.spriteCanvasView._selectedSprites = [];

        // Select all detected sprites
        rects.forEach(rect => {
            const sprite = this.spriteCanvasView._selectSprite(rect, rect);
            this.spriteCanvasView._selectedSprites.push(sprite);
        });

        this.spriteCanvasView.trigger('selectedSpritesChange', this.spriteCanvasView._selectedSprites);
        
        return rects.length;
    }
}

export default AutoSlicer;
