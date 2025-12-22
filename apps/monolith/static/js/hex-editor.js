/**
 * Advanced Hex Editor - hexed.it style
 * Provides professional hex editing interface with scrolling and editing capabilities
 */

class HexEditor {
    constructor(container, filePath) {
        this.container = container;
        this.filePath = filePath;
        this.offset = 0;
        this.bytesPerRow = 16;
        this.rowsPerPage = 32;  // Load 32 rows at a time (512 bytes)
        this.data = [];
        this.totalSize = 0;
        this.modified = new Map();
        this.selectedByte = null;

        // Search state
        this.searchResults = [];
        this.currentSearchIndex = -1;
        this.lastSearchQuery = '';

        this.init();
    }

    async init() {
        this.renderUI();
        await this.loadData(0);
        this.attachEventListeners();
    }

    renderUI() {
        this.container.innerHTML = `
            <div class="hex-editor-wrapper">
                <div class="hex-editor-toolbar">
                    <div class="hex-toolbar-row">
                        <input type="text" id="hexSearchInput" placeholder="Search hex" class="hex-search-input">
                        <button onclick="hexEditor.search()" class="hex-btn hex-btn-primary hex-btn-small">Find</button>
                        <button onclick="hexEditor.findNext()" class="hex-btn hex-btn-small" id="hexFindNext" disabled>Next</button>
                        <button onclick="hexEditor.findPrevious()" class="hex-btn hex-btn-small" id="hexFindPrev" disabled>Prev</button>
                    </div>
                    <div class="hex-toolbar-row">
                        <input type="text" id="hexGotoInput" placeholder="Address" class="hex-goto-input">
                        <button onclick="hexEditor.gotoAddress()" class="hex-btn hex-btn-small">Go</button>
                        <button onclick="hexEditor.saveChanges()" class="hex-btn hex-btn-success hex-btn-small" id="hexSaveBtn" disabled>Save</button>
                        <button onclick="hexEditor.reset()" class="hex-btn hex-btn-warning hex-btn-small">Reset</button>
                    </div>
                </div>
                
                <div class="hex-editor-header">
                    <div class="hex-col-address">Address</div>
                    <div class="hex-col-hex">
                        <span>00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F</span>
                    </div>
                    <div class="hex-col-ascii">ASCII</div>
                </div>
                
                <div class="hex-editor-content" id="hexEditorContent">
                    <div class="hex-loading">Loading hex data...</div>
                </div>
                
                <div class="hex-editor-footer">
                    <span id="hexModifiedInfo">No modifications</span>
                    <span id="hexPositionInfo">Position: 0x00000000</span>
                </div>
            </div>
        `;
    }

    async loadData(offset = 0) {
        try {
            const response = await fetch('/api/forensic/hex', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_path: this.filePath,
                    offset: offset,
                    length: this.bytesPerRow * this.rowsPerPage
                })
            });

            const result = await response.json();

            if (result.error) {
                this.showError(result.error);
                return;
            }

            this.totalSize = result.total_size;
            this.offset = result.offset;

            // Update file info (if element exists)
            const sizeInfo = document.getElementById('hexSizeInfo');
            if (sizeInfo) {
                sizeInfo.textContent = `Size: ${this.formatSize(this.totalSize)} (${this.totalSize} bytes)`;
            }

            // Render hex data
            this.renderHexData(result.data, result.offset);

        } catch (error) {
            this.showError(error.message);
        }
    }

    renderHexData(data, startOffset) {
        const contentDiv = document.getElementById('hexEditorContent');
        contentDiv.innerHTML = '';

        for (let i = 0; i < data.length; i += this.bytesPerRow) {
            const rowBytes = data.slice(i, i + this.bytesPerRow);
            const address = startOffset + i;

            const row = this.createHexRow(address, rowBytes);
            contentDiv.appendChild(row);
        }
    }

    createHexRow(address, bytes) {
        const row = document.createElement('div');
        row.className = 'hex-row';

        // Address column
        const addrDiv = document.createElement('div');
        addrDiv.className = 'hex-address';
        addrDiv.textContent = this.formatAddress(address);
        row.appendChild(addrDiv);

        // Hex bytes column
        const hexDiv = document.createElement('div');
        hexDiv.className = 'hex-bytes';

        for (let i = 0; i < this.bytesPerRow; i++) {
            const byteSpan = document.createElement('span');
            byteSpan.className = 'hex-byte';

            if (i < bytes.length) {
                const byteValue = bytes[i];
                const byteAddr = address + i;

                byteSpan.textContent = this.formatByte(byteValue);
                byteSpan.dataset.address = byteAddr;
                byteSpan.dataset.value = byteValue;

                // Check if modified
                if (this.modified.has(byteAddr)) {
                    byteSpan.classList.add('modified');
                    byteSpan.dataset.value = this.modified.get(byteAddr);
                    byteSpan.textContent = this.formatByte(this.modified.get(byteAddr));
                }

                // Make editable
                byteSpan.contentEditable = true;
                byteSpan.addEventListener('focus', (e) => this.onByteFocus(e));
                byteSpan.addEventListener('blur', (e) => this.onByteBlur(e));
                byteSpan.addEventListener('keydown', (e) => this.onByteKeydown(e));
                byteSpan.addEventListener('click', (e) => this.onByteClick(e));
            } else {
                byteSpan.textContent = '  ';
                byteSpan.classList.add('empty');
            }

            hexDiv.appendChild(byteSpan);

            // Add space after 8 bytes
            if (i === 7) {
                const space = document.createElement('span');
                space.className = 'hex-spacer';
                space.textContent = ' ';
                hexDiv.appendChild(space);
            }
        }

        row.appendChild(hexDiv);

        // ASCII column
        const asciiDiv = document.createElement('div');
        asciiDiv.className = 'hex-ascii';

        for (let i = 0; i < bytes.length; i++) {
            const charSpan = document.createElement('span');
            charSpan.className = 'ascii-char';

            const byteValue = this.modified.get(address + i) || bytes[i];
            charSpan.textContent = this.toASCII(byteValue);

            asciiDiv.appendChild(charSpan);
        }

        row.appendChild(asciiDiv);

        return row;
    }

    formatAddress(addr) {
        return addr.toString(16).toUpperCase().padStart(8, '0');
    }

    formatByte(byte) {
        return byte.toString(16).toUpperCase().padStart(2, '0');
    }

    toASCII(byte) {
        return (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';
    }

    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    onByteFocus(e) {
        e.target.classList.add('editing');
        this.selectedByte = e.target;
    }

    onByteBlur(e) {
        e.target.classList.remove('editing');
        const newValue = e.target.textContent.trim().toUpperCase();
        const address = parseInt(e.target.dataset.address);
        const originalValue = parseInt(e.target.dataset.value);

        // Validate hex input
        if (/^[0-9A-F]{1,2}$/.test(newValue)) {
            const byteValue = parseInt(newValue, 16);

            if (byteValue !== originalValue) {
                this.modified.set(address, byteValue);
                e.target.classList.add('modified');
                e.target.dataset.value = byteValue;
                this.updateModifiedInfo();
            }

            e.target.textContent = this.formatByte(byteValue);
        } else {
            // Invalid input, revert
            e.target.textContent = this.formatByte(originalValue);
        }
    }

    onByteKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            e.target.textContent = this.formatByte(parseInt(e.target.dataset.value));
            e.target.blur();
        }
    }

    onByteClick(e) {
        const address = parseInt(e.target.dataset.address);
        document.getElementById('hexPositionInfo').textContent =
            `Position: 0x${this.formatAddress(address)}`;
    }

    updateModifiedInfo() {
        const count = this.modified.size;
        const saveBtn = document.getElementById('hexSaveBtn');

        document.getElementById('hexModifiedInfo').textContent =
            count > 0 ? `${count} byte(s) modified` : 'No modifications';

        // Enable/disable save button
        if (saveBtn) {
            saveBtn.disabled = count === 0;
        }
    }

    async saveChanges() {
        if (this.modified.size === 0) {
            alert('No modifications to save');
            return;
        }

        const confirmMsg = `Save ${this.modified.size} modification(s) to a new file?\n\nNote: This will download a modified copy. The original file will not be changed.`;

        if (!confirm(confirmMsg)) {
            return;
        }

        try {
            // Get original file data
            const response = await fetch('/api/forensic/hex', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_path: this.filePath,
                    offset: 0,
                    length: this.totalSize
                })
            });

            const result = await response.json();

            if (result.error) {
                alert('Error loading file: ' + result.error);
                return;
            }

            // Apply modifications
            const fileData = new Uint8Array(result.data);

            for (const [address, value] of this.modified.entries()) {
                if (address < fileData.length) {
                    fileData[address] = value;
                }
            }

            // Create blob and download
            const blob = new Blob([fileData], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'modified_' + this.filePath.split('/').pop();
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast('File saved successfully!', 'success');

        } catch (error) {
            alert('Error saving file: ' + error.message);
        }
    }

    attachEventListeners() {
        const contentDiv = document.getElementById('hexEditorContent');

        // Scroll loading
        contentDiv.addEventListener('scroll', () => {
            const scrollTop = contentDiv.scrollTop;
            const scrollHeight = contentDiv.scrollHeight;
            const clientHeight = contentDiv.clientHeight;

            // Load more when near bottom
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                const nextOffset = this.offset + (this.bytesPerRow * this.rowsPerPage);
                if (nextOffset < this.totalSize) {
                    this.loadMore(nextOffset);
                }
            }
        });
    }

    async loadMore(offset) {
        // Prevent multiple simultaneous loads
        if (this.loading) return;
        this.loading = true;

        try {
            const response = await fetch('/api/forensic/hex', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_path: this.filePath,
                    offset: offset,
                    length: this.bytesPerRow * this.rowsPerPage
                })
            });

            const result = await response.json();

            if (!result.error && result.data.length > 0) {
                const contentDiv = document.getElementById('hexEditorContent');
                const currentScrollTop = contentDiv.scrollTop;

                // Append new rows
                for (let i = 0; i < result.data.length; i += this.bytesPerRow) {
                    const rowBytes = result.data.slice(i, i + this.bytesPerRow);
                    const address = result.offset + i;
                    const row = this.createHexRow(address, rowBytes);
                    contentDiv.appendChild(row);
                }

                this.offset = result.offset;

                // Restore scroll position
                contentDiv.scrollTop = currentScrollTop;
            }
        } catch (error) {
            console.error('Error loading more data:', error);
        } finally {
            this.loading = false;
        }
    }

    search() {
        const searchInput = document.getElementById('hexSearchInput');
        const query = searchInput.value.trim().toUpperCase().replace(/\s/g, '');

        if (!query) {
            alert('Please enter a hex pattern to search');
            return;
        }

        // Validate hex
        if (!/^[0-9A-F]+$/.test(query)) {
            alert('Invalid hex pattern. Use only 0-9 and A-F');
            return;
        }

        // Ensure even length (pairs of hex digits)
        if (query.length % 2 !== 0) {
            alert('Hex pattern must have even number of characters');
            return;
        }

        // Clear previous highlights
        document.querySelectorAll('.search-highlight, .search-current').forEach(el => {
            el.classList.remove('search-highlight', 'search-current');
        });

        // Find all matches in current view
        const bytes = document.querySelectorAll('.hex-byte:not(.empty)');
        this.searchResults = [];
        const patternLength = query.length / 2;

        let i = 0;
        while (i < bytes.length) {
            const byteElem = bytes[i];

            // Check if this position starts a match
            if (byteElem.textContent.trim() === query.substring(0, 2)) {
                let match = true;

                // Check if entire pattern matches
                for (let j = 1; j < patternLength; j++) {
                    const nextByte = bytes[i + j];
                    const expectedHex = query.substring(j * 2, j * 2 + 2);

                    if (!nextByte || nextByte.textContent.trim() !== expectedHex) {
                        match = false;
                        break;
                    }
                }

                if (match) {
                    // Store this match
                    const matchElements = [];
                    for (let j = 0; j < patternLength; j++) {
                        matchElements.push(bytes[i + j]);
                    }

                    this.searchResults.push({
                        startIndex: i,
                        length: patternLength,
                        elements: matchElements
                    });

                    // Skip past this match to avoid overlapping
                    i += patternLength;
                    continue;
                }
            }

            i++;
        }

        this.lastSearchQuery = query;

        if (this.searchResults.length > 0) {
            this.currentSearchIndex = 0;
            this.highlightSearchResult(0);

            // Enable navigation buttons
            document.getElementById('hexFindNext').disabled = false;
            document.getElementById('hexFindPrev').disabled = false;

            showToast(`Found ${this.searchResults.length} match(es)`, 'success');
        } else {
            this.currentSearchIndex = -1;
            document.getElementById('hexFindNext').disabled = true;
            document.getElementById('hexFindPrev').disabled = true;
            alert('Pattern not found in current view');
        }
    }

    findNext() {
        if (this.searchResults.length === 0) return;

        // Move to next match
        this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResults.length;
        this.highlightSearchResult(this.currentSearchIndex);
    }

    findPrevious() {
        if (this.searchResults.length === 0) return;

        // Move to previous match
        this.currentSearchIndex = (this.currentSearchIndex - 1 + this.searchResults.length) % this.searchResults.length;
        this.highlightSearchResult(this.currentSearchIndex);
    }

    highlightSearchResult(index) {
        // Clear all current highlights
        document.querySelectorAll('.search-current').forEach(el => {
            el.classList.remove('search-current');
        });

        // Remove all highlights first
        document.querySelectorAll('.search-highlight').forEach(el => {
            el.classList.remove('search-highlight');
        });

        // Highlight all matches in light green
        this.searchResults.forEach((result) => {
            result.elements.forEach(el => {
                el.classList.add('search-highlight');
            });
        });

        // Highlight current match in bright green
        if (this.searchResults[index]) {
            this.searchResults[index].elements.forEach(el => {
                el.classList.add('search-current');
            });

            // Scroll to current match
            if (this.searchResults[index].elements[0]) {
                this.searchResults[index].elements[0].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }

        // Update footer
        document.getElementById('hexPositionInfo').textContent =
            `Match ${index + 1} of ${this.searchResults.length}`;
    }

    gotoAddress() {
        const input = document.getElementById('hexGotoInput');
        const address = input.value.trim();

        if (!address) {
            alert('Please enter an address');
            return;
        }

        const addr = parseInt(address, 16);
        if (isNaN(addr) || addr < 0 || addr >= this.totalSize) {
            alert('Invalid address');
            return;
        }

        // Reload from this address
        this.loadData(addr - (addr % this.bytesPerRow));
        input.value = '';
    }

    reset() {
        if (this.modified.size === 0) {
            alert('No modifications to reset');
            return;
        }

        if (confirm(`Reset ${this.modified.size} modification(s)?`)) {
            this.modified.clear();
            this.loadData(this.offset);
            this.updateModifiedInfo();
        }
    }

    showError(message) {
        const contentDiv = document.getElementById('hexEditorContent');
        contentDiv.innerHTML = `
            <div class="hex-error">
                <p>Error loading hex data:</p>
                <p>${message}</p>
            </div>
        `;
    }
}

// Global instance
window.hexEditor = null;
