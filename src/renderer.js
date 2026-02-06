// --- CONFIGURAÇÃO E DADOS ---
// No Electron, o localStorage funciona como num navegador comum
let plans = JSON.parse(localStorage.getItem('treino_funcional_db')) || [];

const rowTemplates = {
    'tb-aquecimento': `<td><input type="text" class="t-ex" placeholder="Ex: Polichinelo"></td><td><input type="text" class="t-time" placeholder="Ex: 30s"></td><td><input type="text" class="t-obs" placeholder="Obs..."></td><td><button type="button" onclick="removeRow(this)" class="btn-remove">X</button></td>`,
    'tb-principal': `<td><input type="text" class="t-ex" placeholder="Ex: Agachamento"></td><td><input type="text" class="t-rep" placeholder="Ex: 15 reps"></td><td><input type="text" class="t-ser" placeholder="Ex: 3x"></td><td><input type="text" class="t-int" placeholder="Ex: 30s descanso"></td><td><button type="button" onclick="removeRow(this)" class="btn-remove">X</button></td>`,
    'tb-calma': `<td><input type="text" class="t-ex" placeholder="Ex: Along. Posterior"></td><td><input type="text" class="t-time" placeholder="Ex: 20s"></td><td><input type="text" class="t-obs" placeholder="Obs..."></td><td><button type="button" onclick="removeRow(this)" class="btn-remove">X</button></td>`
};

// Funções de manipulação da UI (Globais para serem chamadas pelo HTML)
window.addRow = function(tableId, data = null) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    const tr = document.createElement('tr');
    tr.innerHTML = rowTemplates[tableId];
    tbody.appendChild(tr);
    if (data) {
        const inputs = tr.querySelectorAll('input');
        if (tableId === 'tb-principal') {
            inputs[0].value = data.ex || ''; inputs[1].value = data.rep || ''; inputs[2].value = data.ser || ''; inputs[3].value = data.int || '';
        } else {
            inputs[0].value = data.ex || ''; inputs[1].value = data.time || ''; inputs[2].value = data.obs || '';
        }
    }
}

window.removeRow = function(btn) { btn.closest('tr').remove(); }

function scrapeTableData(tableId) {
    return Array.from(document.querySelectorAll(`#${tableId} tbody tr`)).map(row => {
        const inputs = row.querySelectorAll('input');
        return tableId === 'tb-principal'
            ? { ex: inputs[0].value, rep: inputs[1].value, ser: inputs[2].value, int: inputs[3].value }
            : { ex: inputs[0].value, time: inputs[1].value, obs: inputs[2].value };
    });
}

// --- SALVAR E EDITAR ---
window.savePlan = function(e) {
    if(e) e.preventDefault();
    const newPlan = {
        id: document.getElementById('plan-id').value || Date.now().toString(),
        header: { 
            professor: document.getElementById('professor').value, 
            data: document.getElementById('data').value, 
            tema: document.getElementById('tema').value, 
            parte_corpo: document.getElementById('parte_corpo').value 
        },
        grupo: { 
            publico: (document.querySelector('input[name="publico"]:checked') || {}).value || '', 
            faixa_etaria: document.getElementById('faixa_etaria').value, 
            qtd: document.getElementById('qtd_alunos').value 
        },
        materiais: Array.from(document.querySelectorAll('#materiais-container input:checked')).map(cb => cb.value),
        materiais_outros: document.getElementById('materiais_outros').value,
        objetivos: Array.from(document.querySelectorAll('#objetivos-container input:checked')).map(cb => cb.value),
        objetivo_especifico: document.getElementById('objetivo_especifico').value,
        aquecimento: scrapeTableData('tb-aquecimento'),
        principal: scrapeTableData('tb-principal'),
        volta_calma: scrapeTableData('tb-calma'),
        controle: { intensidade: document.getElementById('intensidade').value, texto: document.getElementById('controle').value }
    };

    const idx = plans.findIndex(p => p.id === newPlan.id);
    if (idx > -1) plans[idx] = newPlan; else plans.push(newPlan);
    localStorage.setItem('treino_funcional_db', JSON.stringify(plans));

    showToast("Salvo com sucesso!");
    showList();
}

window.createNew = function() {
    document.getElementById('training-form').reset();
    document.getElementById('plan-id').value = '';
    document.querySelectorAll('tbody').forEach(tb => tb.innerHTML = '');
    addRow('tb-aquecimento'); addRow('tb-principal'); addRow('tb-calma');
    showForm();
}

window.editPlan = function(id) {
    const plan = plans.find(p => p.id === id);
    if (!plan) return;
    document.getElementById('plan-id').value = plan.id;
    document.getElementById('professor').value = plan.header.professor;
    document.getElementById('data').value = plan.header.data;
    document.getElementById('tema').value = plan.header.tema;
    document.getElementById('parte_corpo').value = plan.header.parte_corpo;

    const radioPub = document.querySelector(`input[name="publico"][value="${plan.grupo.publico}"]`);
    if (radioPub) radioPub.checked = true;
    document.getElementById('faixa_etaria').value = plan.grupo.faixa_etaria;
    document.getElementById('qtd_alunos').value = plan.grupo.qtd;
    document.getElementById('materiais_outros').value = plan.materiais_outros || '';
    document.getElementById('objetivo_especifico').value = plan.objetivo_especifico;
    document.getElementById('intensidade').value = plan.controle.intensidade;
    document.getElementById('controle').value = plan.controle.texto;

    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    plan.materiais.forEach(val => { const cb = document.querySelector(`#materiais-container input[value="${val}"]`); if (cb) cb.checked = true; });
    plan.objetivos.forEach(val => { const cb = document.querySelector(`#objetivos-container input[value="${val}"]`); if (cb) cb.checked = true; });

    document.querySelectorAll('tbody').forEach(tb => tb.innerHTML = '');
    plan.aquecimento.forEach(row => addRow('tb-aquecimento', row));
    plan.principal.forEach(row => addRow('tb-principal', row));
    plan.volta_calma.forEach(row => addRow('tb-calma', row));
    showForm();
}

window.deletePlan = function(id) {
    if (confirm('Excluir este plano?')) {
        plans = plans.filter(p => p.id !== id);
        localStorage.setItem('treino_funcional_db', JSON.stringify(plans));
        renderList();
    }
}

window.duplicatePlan = function(id) {
    const originalPlan = plans.find(p => p.id === id);
    if (!originalPlan) return;
    const newPlan = JSON.parse(JSON.stringify(originalPlan));
    newPlan.id = Date.now().toString();
    newPlan.header.tema = newPlan.header.tema + " (Cópia)";
    plans.push(newPlan);
    localStorage.setItem('treino_funcional_db', JSON.stringify(plans));
    renderList();
    showToast("Treino duplicado!");
    editPlan(newPlan.id);
}

// --- NAVEGAÇÃO E LISTAGEM ---
window.showList = function() { 
    document.getElementById('view-form').classList.add('hidden'); 
    document.getElementById('view-list').classList.remove('hidden'); 
    renderList(); 
    window.scrollTo(0,0); 
}

window.showForm = function() { 
    document.getElementById('view-list').classList.add('hidden'); 
    document.getElementById('view-form').classList.remove('hidden'); 
    window.scrollTo(0,0); 
}

function renderList() {
    const container = document.getElementById('plans-container');
    if (plans.length === 0) { 
        container.innerHTML = '<div class="text-gray-500">Nenhum plano salvo.</div>'; 
        return; 
    }

    container.innerHTML = plans.map(p => `
    <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
        <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-lg text-slate-800">${p.header.tema || 'Sem Título'}</h3>
            <span class="text-xs font-bold px-2 py-1 bg-gray-200 rounded">${p.header.data.split('-').reverse().join('/')}</span>
        </div>
        <p class="text-sm text-gray-600 mb-4">Prof: ${p.header.professor}</p>
        <div class="grid grid-cols-2 gap-2 mt-4">
            <button onclick="openView('${p.id}')" class="bg-slate-100 text-slate-700 py-2 rounded text-sm font-bold col-span-2 border hover:bg-slate-200">👁️ Visualizar</button>
            <button onclick="duplicatePlan('${p.id}')" class="bg-amber-100 text-amber-700 py-2 rounded text-sm font-bold col-span-2 border border-amber-200">👯 Duplicar</button>
            <button onclick="editPlan('${p.id}')" class="bg-blue-100 text-blue-700 py-2 rounded text-sm font-bold">Editar</button>
            <button onclick="deletePlan('${p.id}')" class="bg-red-100 text-red-700 py-2 rounded text-sm font-bold">Excluir</button>
            <button onclick="generatePDF('${p.id}')" class="bg-slate-700 text-white py-2 rounded text-sm font-bold col-span-2">📄 Baixar PDF</button>
        </div>
    </div>`).join('');
}

// --- GERAÇÃO DE PDF ---
window.generatePDF = function(id) {
    const plan = plans.find(p => p.id === id);
    if (!plan) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("PLANO DE TREINO FUNCIONAL", 105, 15, { align: "center" });

    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    let y = 25;
    doc.text(`Professor(a): ${plan.header.professor}`, 14, y);
    doc.text(`Data: ${plan.header.data.split('-').reverse().join('/')}`, 140, y); y += 7;
    doc.text(`Tema: ${plan.header.tema}`, 14, y); y += 7;

    doc.autoTable({ 
        startY: y + 10, 
        head: [['EXERCÍCIOS PRINCIPAIS', 'Rep/Tempo', 'Séries', 'Obs']], 
        body: plan.principal.map(r => [r.ex, r.rep, r.ser, r.int]),
        theme: 'grid'
    });

    const fileName = `Treino_${plan.header.tema.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
}

// --- UTILS ---
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('training-form').addEventListener('submit', savePlan);
    renderList();
});