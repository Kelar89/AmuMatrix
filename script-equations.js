document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let equationCount = 3;

    // --- DOM Element References ---
    const grid = document.getElementById('equations-grid');
    const plusBtn = document.getElementById('eq-plus');
    const minusBtn = document.getElementById('eq-minus');
    const randomBtn = document.getElementById('random-btn');
    const clearBtn = document.getElementById('clear-btn');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const solveBtn = document.getElementById('solve-btn');
    const resultArea = document.getElementById('result-area');
    const solveMethodSelect = document.getElementById('solve-method');

    // --- Helper Functions ---
    function createMatrixDisplay(matrixData, cellClass = 'result-cell') {
        const fragment = document.createDocumentFragment();
        const rows = matrixData.length;
        const cols = matrixData[0] ? matrixData[0].length : 0;
        const leftParen = document.createElement('div');
        leftParen.className = 'matrix-parenthesis';
        leftParen.textContent = '[';
        const grid = document.createElement('div');
        grid.className = 'result-grid';
        grid.style.gridTemplateColumns = `repeat(${cols}, auto)`;
        matrixData.forEach(rowData => {
            rowData.forEach(cellData => {
                const cell = document.createElement('div');
                cell.className = `result-cell ${cellClass}`;
                cell.textContent = Number(cellData.toFixed(4));
                grid.appendChild(cell);
            });
        });
        const rightParen = document.createElement('div');
        rightParen.className = 'matrix-parenthesis';
        rightParen.textContent = ']';
        fragment.append(leftParen, grid, rightParen);
        return fragment;
    }

    function displayError(message) {
        resultArea.innerHTML = `<div class="result-error">${message}</div>`;
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }

    function calculateREF(matrix) {
        let mat = matrix.map(row => [...row]);
        const rows = mat.length;
        if (rows === 0) return [];
        const cols = mat[0].length;
        if (cols === 0) return [[]];
        let lead = 0;
        for (let r = 0; r < rows; r++) {
            if (lead >= cols) { return mat; }
            let i = r;
            while (mat[i][lead] === 0) {
                i++;
                if (i === rows) {
                    i = r;
                    lead++;
                    if (cols === lead) { return mat; }
                }
            }
            [mat[i], mat[r]] = [mat[r], mat[i]];
            let val = mat[r][lead];
            if (val !== 0) {
                for (let j = 0; j < cols; j++) { mat[r][j] /= val; }
            }
            for (let i = 0; i < rows; i++) {
                if (i === r) continue;
                val = mat[i][lead];
                for (let j = 0; j < cols; j++) {
                    mat[i][j] -= val * mat[r][j];
                }
            }
            lead++;
        }
        return mat;
    }
    
    // --- Core Functions ---

    function renderSystem() {
        grid.innerHTML = '';
        const varCount = equationCount;
        
        // Atur grid CSS: (varCount untuk input) + (varCount - 1 untuk '+') + (1 untuk '=') + (1 untuk konstanta)
        const totalColumns = varCount * 2 + 1;
        grid.style.gridTemplateColumns = `repeat(${totalColumns}, auto)`;

        for (let i = 0; i < equationCount; i++) {
            const row = document.createElement('div');
            row.className = 'equation-row';
            row.style.gridColumn = `1 / ${totalColumns + 1}`; // Setiap baris mencakup semua kolom
            row.style.display = 'contents'; // Agar elemen di dalamnya menjadi bagian dari grid utama

            // Input koefisien x1, x2, ...
            for (let j = 0; j < varCount; j++) {
                const cell = document.createElement('div');
                cell.className = 'equation-cell';
                
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'coeff-input';
                input.dataset.row = i;
                input.dataset.col = j;
                cell.appendChild(input);

                const label = document.createElement('label');
                label.innerHTML = `x<sub>${j + 1}</sub>`;
                cell.appendChild(label);
                
                grid.appendChild(cell);

                // Tambahkan '+' jika bukan variabel terakhir
                if (j < varCount - 1) {
                    const plusSign = document.createElement('span');
                    plusSign.className = 'equation-cell';
                    plusSign.textContent = '+';
                    grid.appendChild(plusSign);
                }
            }

            // Elemen sama dengan (=)
            const equalsSign = document.createElement('span');
            equalsSign.className = 'equation-cell';
            equalsSign.textContent = '=';
            grid.appendChild(equalsSign);
            
            // Input konstanta (setelah =)
            const constCell = document.createElement('div');
            constCell.className = 'equation-cell';
            const constInput = document.createElement('input');
            constInput.type = 'text';
            constInput.className = 'const-input';
            constInput.dataset.row = i;
            constCell.appendChild(constInput);
            grid.appendChild(constCell);
        }
    }

    function getSystemData() {
        const coefficients = [];
        const constants = [];
        for (let i = 0; i < equationCount; i++) {
            const coeffRow = [];
            for (let j = 0; j < equationCount; j++) {
                const input = grid.querySelector(`.coeff-input[data-row="${i}"][data-col="${j}"]`);
                coeffRow.push(parseFloat(input.value) || 0);
            }
            coefficients.push(coeffRow);
            const constInput = grid.querySelector(`.const-input[data-row="${i}"]`);
            constants.push(parseFloat(constInput.value) || 0);
        }
        return { coefficients, constants };
    }

    function solveSystem(coefficients, constants, method) {
        if (method === 'gaussian') {
            try {
                if (math.det(coefficients) === 0) {
                    return { solution: null, error: 'Sistem ini tidak memiliki solusi unik (determinan matriks koefisien adalah 0).' };
                }
                const solution = math.lusolve(coefficients, constants);
                return { solution: solution.map(val => val[0]) };
            } catch (e) {
                return { solution: null, error: e.message };
            }
        }
        return { solution: null, error: 'Metode ini belum diimplementasikan.' };
    }

    function displaySolution(data) {
        const { coefficients, constants, solution, error, method } = data;
        resultArea.innerHTML = '';
        if (error) {
            displayError(error);
            return;
        }

        const resultBlock = document.createElement('div');
        resultBlock.className = 'result-block';
        
        const title = document.createElement('h3');
        title.className = 'result-title';
        title.textContent = `Solution by ${method.replace(/-/g, ' ')}`;
        resultBlock.appendChild(title);

        const augmentedMatrix = coefficients.map((row, i) => [...row, constants[i]]);
        
        const step1Text = document.createElement('p');
        step1Text.className = 'result-explanation';
        step1Text.textContent = 'Ubah sistem menjadi matriks augmentasi [A|b] dan ubah ke bentuk eselon baris:';
        resultBlock.appendChild(step1Text);

        const refMatrix = calculateREF(augmentedMatrix);
        const step1MatrixDiv = document.createElement('div');
        step1MatrixDiv.className = 'result-step';
        step1MatrixDiv.appendChild(createMatrixDisplay(refMatrix));
        resultBlock.appendChild(step1MatrixDiv);

        const step2Text = document.createElement('p');
        step2Text.className = 'result-explanation';
        step2Text.innerHTML = `Setelah diubah ke bentuk eselon baris, kita dapat melakukan substitusi mundur untuk menemukan variabel.`;
        resultBlock.appendChild(step2Text);

        const step3Text = document.createElement('p');
        step3Text.className = 'result-explanation';
        step3Text.innerHTML = `<strong>Jawaban (Answer):</strong>`;
        resultBlock.appendChild(step3Text);

        const solutionContainer = document.createElement('div');
        solutionContainer.className = 'result-explanation';
        solution.forEach((val, i) => {
            const p = document.createElement('p');
            p.innerHTML = `x<sub>${i+1}</sub> = ${Number(val.toFixed(4))}`;
            solutionContainer.appendChild(p);
        });
        resultBlock.appendChild(solutionContainer);

        resultArea.appendChild(resultBlock);
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }

    // --- Event Listeners ---
    plusBtn.addEventListener('click', () => { if (equationCount < 8) { equationCount++; renderSystem(); } });
    minusBtn.addEventListener('click', () => { if (equationCount > 2) { equationCount--; renderSystem(); } });
    
    randomBtn.addEventListener('click', () => {
        const inputs = document.querySelectorAll('.equations-grid input[type="text"]');
        inputs.forEach(input => {
            input.value = Math.floor(Math.random() * 21) - 10;
        });
    });

    clearBtn.addEventListener('click', () => {
        const inputs = document.querySelectorAll('.equations-grid input[type="text"]');
        inputs.forEach(input => {
            input.value = '';
        });
        resultArea.innerHTML = '';
    });
    
    solveBtn.addEventListener('click', () => {
        const { coefficients, constants } = getSystemData();
        const method = solveMethodSelect.value;
        const { solution, error } = solveSystem(coefficients, constants, method);
        displaySolution({ coefficients, constants, solution, error, method: "Gaussian Elimination" });
    });

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // --- Initial Render ---
    renderSystem();
});