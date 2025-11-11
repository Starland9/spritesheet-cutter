import $ from 'jquery';

class SelectedSprite {
    constructor(rect, highlight, spriteCanvasView) {
        this.rect = rect;
        this.highlight = highlight;
        this.spriteCanvasView = spriteCanvasView;
        this.resizeHandles = [];
        this.isDragging = false;
        this.isResizing = false;
        
        this.highlight.moveTo(rect, true);
        this._addResizeHandles();
        this._setupInteractions();
    }

    _addResizeHandles() {
        const positions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
        const $container = this.highlight._$container;
        
        positions.forEach(pos => {
            const $handle = $('<div class="resize-handle resize-' + pos + '"/>').appendTo($container);
            this.resizeHandles.push({ pos, $el: $handle });
        });
    }

    _setupInteractions() {
        const self = this;
        const $container = this.highlight._$container;
        const $document = $(document);
        let startX, startY, startRect;

        // Dragging the entire selection
        $container.on('mousedown', function(e) {
            if ($(e.target).hasClass('resize-handle')) return;
            if (e.button !== 0) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            self.isDragging = true;
            startX = e.pageX;
            startY = e.pageY;
            startRect = Object.assign({}, self.rect);
        });

        // Resizing via handles
        this.resizeHandles.forEach(handle => {
            handle.$el.on('mousedown', function(e) {
                if (e.button !== 0) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                self.isResizing = handle.pos;
                startX = e.pageX;
                startY = e.pageY;
                startRect = Object.assign({}, self.rect);
            });
        });

        $document.on('mousemove', function(e) {
            if (self.isDragging) {
                const dx = e.pageX - startX;
                const dy = e.pageY - startY;
                
                self.rect.x = startRect.x + dx;
                self.rect.y = startRect.y + dy;
                self.highlight.moveTo(self.rect, false);
            } else if (self.isResizing) {
                const dx = e.pageX - startX;
                const dy = e.pageY - startY;
                
                self._handleResize(self.isResizing, dx, dy, startRect);
            }
        });

        $document.on('mouseup', function() {
            if (self.isDragging || self.isResizing) {
                self.isDragging = false;
                self.isResizing = false;
                
                // Notify that rect changed
                if (self.spriteCanvasView) {
                    self.spriteCanvasView.trigger('rectAdjusted', self);
                }
            }
        });
    }

    _handleResize(position, dx, dy, startRect) {
        switch(position) {
            case 'nw':
                this.rect.x = startRect.x + dx;
                this.rect.y = startRect.y + dy;
                this.rect.width = Math.max(1, startRect.width - dx);
                this.rect.height = Math.max(1, startRect.height - dy);
                break;
            case 'ne':
                this.rect.y = startRect.y + dy;
                this.rect.width = Math.max(1, startRect.width + dx);
                this.rect.height = Math.max(1, startRect.height - dy);
                break;
            case 'sw':
                this.rect.x = startRect.x + dx;
                this.rect.width = Math.max(1, startRect.width - dx);
                this.rect.height = Math.max(1, startRect.height + dy);
                break;
            case 'se':
                this.rect.width = Math.max(1, startRect.width + dx);
                this.rect.height = Math.max(1, startRect.height + dy);
                break;
            case 'n':
                this.rect.y = startRect.y + dy;
                this.rect.height = Math.max(1, startRect.height - dy);
                break;
            case 's':
                this.rect.height = Math.max(1, startRect.height + dy);
                break;
            case 'e':
                this.rect.width = Math.max(1, startRect.width + dx);
                break;
            case 'w':
                this.rect.x = startRect.x + dx;
                this.rect.width = Math.max(1, startRect.width - dx);
                break;
        }
        
        this.highlight.moveTo(this.rect, false);
    }

    unselect() {
        this.highlight.remove();
    }
}

export default SelectedSprite;