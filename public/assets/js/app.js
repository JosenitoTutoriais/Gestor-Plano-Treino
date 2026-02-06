     // --- CONFIGURAÇÃO E DADOS ---
        let plans = JSON.parse(localStorage.getItem('treino_funcional_db')) || [];

        const rowTemplates = {
            'tb-aquecimento': `<td><input type="text" class="t-ex" placeholder="Ex: Polichinelo"></td><td><input type="text" class="t-time" placeholder="Ex: 30s"></td><td><input type="text" class="t-obs" placeholder="Obs..."></td><td><button type="button" onclick="removeRow(this)" class="btn-remove">X</button></td>`,
            'tb-principal': `<td><input type="text" class="t-ex" placeholder="Ex: Agachamento"></td><td><input type="text" class="t-rep" placeholder="Ex: 15 reps"></td><td><input type="text" class="t-ser" placeholder="Ex: 3x"></td><td><input type="text" class="t-int" placeholder="Ex: 30s descanso"></td><td><button type="button" onclick="removeRow(this)" class="btn-remove">X</button></td>`,
            'tb-calma': `<td><input type="text" class="t-ex" placeholder="Ex: Along. Posterior"></td><td><input type="text" class="t-time" placeholder="Ex: 20s"></td><td><input type="text" class="t-obs" placeholder="Obs..."></td><td><button type="button" onclick="removeRow(this)" class="btn-remove">X</button></td>`
        };

        function addRow(tableId, data = null) {
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

        function removeRow(btn) { btn.closest('tr').remove(); }

        function scrapeTableData(tableId) {
            return Array.from(document.querySelectorAll(`#${tableId} tbody tr`)).map(row => {
                const inputs = row.querySelectorAll('input');
                return tableId === 'tb-principal'
                    ? { ex: inputs[0].value, rep: inputs[1].value, ser: inputs[2].value, int: inputs[3].value }
                    : { ex: inputs[0].value, time: inputs[1].value, obs: inputs[2].value };
            });
        }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            toast.innerText = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // --- SALVAR E EDITAR ---
        function savePlan(e) {
            e.preventDefault();
            const newPlan = {
                id: document.getElementById('plan-id').value || Date.now().toString(),
                header: { professor: document.getElementById('professor').value, data: document.getElementById('data').value, tema: document.getElementById('tema').value, parte_corpo: document.getElementById('parte_corpo').value },
                grupo: { publico: (document.querySelector('input[name="publico"]:checked') || {}).value || '', faixa_etaria: document.getElementById('faixa_etaria').value, qtd: document.getElementById('qtd_alunos').value },
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

        function createNew() {
            document.getElementById('training-form').reset();
            document.getElementById('plan-id').value = '';
            document.querySelectorAll('tbody').forEach(tb => tb.innerHTML = '');
            addRow('tb-aquecimento'); addRow('tb-principal'); addRow('tb-calma');
            showForm();
        }

        function editPlan(id) {
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

        function deletePlan(id) {
            if (confirm('Excluir este plano?')) {
                plans = plans.filter(p => p.id !== id);
                localStorage.setItem('treino_funcional_db', JSON.stringify(plans));
                renderList();
            }
        }

        function duplicatePlan(id) {
            const originalPlan = plans.find(p => p.id === id);
            if (!originalPlan) return;
            const newPlan = JSON.parse(JSON.stringify(originalPlan));
            newPlan.id = Date.now().toString();
            newPlan.header.tema = newPlan.header.tema + " (Cópia)";
            plans.push(newPlan);
            localStorage.setItem('treino_funcional_db', JSON.stringify(plans));
            renderList();
            showToast("Treino duplicado!");
        }

        function showList() { document.getElementById('view-form').classList.add('hidden'); document.getElementById('view-list').classList.remove('hidden'); renderList(); window.scrollTo(0, 0); }
        function showForm() { document.getElementById('view-list').classList.add('hidden'); document.getElementById('view-form').classList.remove('hidden'); window.scrollTo(0, 0); }

        function renderList() {
            const container = document.getElementById('plans-container');
            if (plans.length === 0) { container.innerHTML = '<div class="text-gray-500 col-span-3 text-center py-10">Nenhum plano criado ainda. Clique em "+ Novo".</div>'; return; }

            container.innerHTML = plans.map(p => `
        <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600 flex flex-col justify-between">
            <div>
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg text-slate-800 leading-tight">${p.header.tema || 'Sem Título'}</h3>
                </div>
                <div class="flex justify-between items-center mb-4">
                     <span class="text-xs font-bold px-2 py-1 bg-gray-200 rounded text-gray-700">📅 ${p.header.data ? p.header.data.split('-').reverse().join('/') : 'S/ Data'}</span>
                     <span class="text-xs text-gray-500 font-medium">Prof: ${p.header.professor || '---'}</span>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-2 mt-auto">
                <button onclick="openView('${p.id}')" class="bg-slate-100 text-slate-700 py-2 rounded text-xs font-bold border hover:bg-slate-200 col-span-2">👁️ Visualizar Detalhes</button>
                
                <button onclick="editPlan('${p.id}')" class="bg-blue-50 text-blue-700 py-2 rounded text-xs font-bold hover:bg-blue-100">✏️ Editar</button>
                <button onclick="duplicatePlan('${p.id}')" class="bg-amber-50 text-amber-700 py-2 rounded text-xs font-bold hover:bg-amber-100">👯 Copiar</button>
                
                <button onclick="generateAndAction('${p.id}', 'download')" class="bg-slate-700 hover:bg-slate-800 text-white py-2 rounded text-xs font-bold col-span-2 flex justify-center items-center gap-2">
                    📄 Baixar PDF
                </button>
                <button onclick="generateAndAction('${p.id}', 'share')" class="bg-green-600 hover:bg-green-700 text-white py-2 rounded text-xs font-bold col-span-2 flex justify-center items-center gap-2">
                    📱 Enviar WhatsApp
                </button>
                
                <button onclick="deletePlan('${p.id}')" class="bg-red-50 text-red-700 py-1 rounded text-xs font-bold hover:bg-red-100 col-span-2 mt-2">🗑️ Excluir</button>
            </div>
        </div>`).join('');
        }

        // --- GERAÇÃO DE PDF UNIFICADA (WEB E DESKTOP) ---
        function generateAndAction(id, action) {
            const plan = plans.find(p => p.id === id);
            if (!plan) return;

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Configuração do PDF
            doc.setFont("helvetica");
            doc.setFontSize(14); doc.setFont("helvetica", "bold");
            doc.text("PLANO DE TREINO FUNCIONAL", 105, 15, { align: "center" });

            doc.setFontSize(10); doc.setFont("helvetica", "normal");
            let y = 25;
            doc.text(`Professor(a): ${plan.header.professor}`, 14, y);
            doc.text(`Data: ${plan.header.data.split('-').reverse().join('/')}`, 140, y); y += 7;
            doc.text(`Modalidade: Treinamento Funcional`, 14, y); y += 7;
            doc.text(`Tema: ${plan.header.tema}`, 14, y); y += 7;
            doc.text(`Foco/Parte do Corpo: ${plan.header.parte_corpo}`, 14, y); y += 10;

            doc.setFillColor(240, 240, 240); doc.rect(14, y, 182, 7, 'F');
            doc.setFont("helvetica", "bold"); doc.text("INFORMAÇÕES DO GRUPO", 16, y + 5); y += 12;
            doc.setFont("helvetica", "normal");
            doc.text(`Público: ${plan.grupo.publico} | Faixa Etária: ${plan.grupo.faixa_etaria} | Alunos: ${plan.grupo.qtd}`, 14, y); y += 8;

            const matText = [...plan.materiais, plan.materiais_outros].filter(Boolean).join(', ');
            doc.text(`Materiais: ${matText}`, 14, y, { maxWidth: 180 });
            y += (doc.splitTextToSize(`Materiais: ${matText}`, 180).length * 5) + 5;

            doc.setFont("helvetica", "bold"); doc.text("OBJETIVOS:", 14, y); doc.setFont("helvetica", "normal"); y += 5;
            const objGerais = plan.objetivos.join(', ');
            doc.text(`Gerais: ${objGerais}`, 14, y, { maxWidth: 180 });
            y += (doc.splitTextToSize(`Gerais: ${objGerais}`, 180).length * 5) + 3;
            doc.text(`Específico: ${plan.objetivo_especifico}`, 14, y, { maxWidth: 180 }); y += 10;

            doc.autoTable({ startY: y, head: [['1. AQUECIMENTO', 'Tempo/Rep', 'Observações']], body: plan.aquecimento.map(r => [r.ex, r.time, r.obs]), theme: 'grid', headStyles: { fillColor: [41, 128, 185] } });
            doc.autoTable({ startY: doc.lastAutoTable.finalY + 10, head: [['2. TREINO PRINCIPAL', 'Rep/Tempo', 'Séries', 'Intervalo']], body: plan.principal.map(r => [r.ex, r.rep, r.ser, r.int]), theme: 'grid', headStyles: { fillColor: [39, 174, 96] } });

            y = doc.lastAutoTable.finalY + 10;
            doc.text(`INTENSIDADE: ${plan.controle.intensidade}`, 14, y); y += 6;
            doc.text(`CONTROLE: ${plan.controle.texto}`, 14, y);

            doc.autoTable({ startY: y + 10, head: [['3. VOLTA À CALMA', 'Tempo', 'Observações']], body: plan.volta_calma.map(r => [r.ex, r.time, r.obs]), theme: 'grid', headStyles: { fillColor: [142, 68, 173] } });

            const fileName = `Treino_${plan.header.tema.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

            // LÓGICA WEB / DESKTOP
            if (action === 'download') {
                // Salva diretamente (Navegador faz download, Electron também)
                doc.save(fileName);
                showToast("Download iniciado!");
            }
            else if (action === 'share') {
                // 1. Baixa o arquivo para o usuário ter o que enviar
                doc.save(fileName);

                // 2. Monta um texto bonito para o corpo da mensagem
                const msg = `*TREINO FUNCIONAL*\n\n` +
                    `*Tema:* ${plan.header.tema}\n` +
                    `*Data:* ${plan.header.data.split('-').reverse().join('/')}\n` +
                    `*Professor:* ${plan.header.professor}\n\n` +
                    `_O arquivo PDF foi baixado no seu dispositivo. Por favor, anexe-o aqui._`;

                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;

                // 3. Avisa o usuário e abre o WhatsApp Web
                alert(`Como estamos no computador:\n\n1. O PDF foi baixado automaticamente.\n2. O WhatsApp Web será aberto.\n3. Cole o texto e ARRASTE o PDF baixado para a conversa.`);
                window.open(whatsappUrl, '_blank');
            }
        }

        // --- IMPORTAR / EXPORTAR ---
        function exportPlans() {
            if (plans.length === 0) { alert("Não há treinos para exportar."); return; }
            const dataStr = JSON.stringify(plans, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_treinos_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        function importPlans(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    if (Array.isArray(importedData)) {
                        const existingIds = new Set(plans.map(p => p.id));
                        const newItems = importedData.filter(item => !existingIds.has(item.id));
                        if (newItems.length === 0) { alert("Todos os treinos já existem."); return; }
                        plans = [...plans, ...newItems];
                        localStorage.setItem('treino_funcional_db', JSON.stringify(plans));
                        renderList();
                        showToast(`${newItems.length} treinos importados!`);
                    } else { alert("Formato inválido."); }
                } catch (err) { alert("Erro ao ler arquivo."); }
                event.target.value = '';
            };
            reader.readAsText(file);
        }

        // --- MODAL ---
        // --- MODAL (VISUALIZAÇÃO ESTILO DOCUMENTO) ---
        function openView(id) {
            const plan = plans.find(p => p.id === id);
            if (!plan) return;

            const modal = document.getElementById('view-modal');
            const content = document.getElementById('modal-content');

            // Configura o botão de editar
            document.getElementById('btn-edit-modal').onclick = () => { closeModal(); editPlan(id); };

            // Formata os materiais e objetivos para exibição
            const materiaisTexto = [...plan.materiais, plan.materiais_outros].filter(Boolean).join(', ');
            const objetivosGerais = plan.objetivos.join(', ');

            // HTML recriado para imitar exatamente o PDF/Imagem
            content.innerHTML = `
            <div class="bg-white p-4 md:p-8 text-gray-800 font-sans text-sm leading-relaxed">
                
                <h1 class="text-xl md:text-2xl font-bold text-center mb-8 uppercase text-black">Plano de Treino Funcional</h1>

                <div class="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                    <div class="space-y-1 flex-1">
                        <p><span class="font-bold">Professor(a):</span> ${plan.header.professor}</p>
                        <p><span class="font-bold">Modalidade:</span> Treinamento Funcional</p>
                        <p><span class="font-bold">Tema:</span> ${plan.header.tema}</p>
                        <p><span class="font-bold">Foco/Parte do Corpo:</span> ${plan.header.parte_corpo}</p>
                    </div>
                    <div>
                        <p><span class="font-bold">Data:</span> ${plan.header.data ? plan.header.data.split('-').reverse().join('/') : 'S/ Data'}</p>
                    </div>
                </div>

                <div class="mb-6">
                    <h3 class="bg-gray-200 font-bold px-3 py-1 mb-3 uppercase text-xs md:text-sm text-black">Informações do Grupo</h3>
                    <div class="px-2">
                        <p class="mb-2">
                            <span class="font-bold">Público:</span> ${plan.grupo.publico} | 
                            <span class="font-bold">Faixa Etária:</span> ${plan.grupo.faixa_etaria} | 
                            <span class="font-bold">Alunos:</span> ${plan.grupo.qtd}
                        </p>
                        <p><span class="font-bold">Materiais:</span> ${materiaisTexto || 'Nenhum listado'}</p>
                    </div>
                </div>

                <div class="mb-8 px-2">
                    <h3 class="font-bold uppercase mb-1 text-black">Objetivos:</h3>
                    <p class="mb-1"><span class="font-bold text-gray-700">Gerais:</span> ${objetivosGerais || '---'}</p>
                    <p><span class="font-bold text-gray-700">Específico:</span> ${plan.objetivo_especifico || '---'}</p>
                </div>

                <div class="mb-6 border border-gray-300">
                    <div class="bg-[#2980b9] text-white font-bold flex px-3 py-2 text-sm">
                        <div class="w-5/12">1. AQUECIMENTO</div>
                        <div class="w-3/12">Tempo/Rep</div>
                        <div class="w-4/12">Observações</div>
                    </div>
                    <div class="divide-y divide-gray-300">
                        ${plan.aquecimento.map(row => `
                            <div class="flex px-3 py-2 text-sm">
                                <div class="w-5/12 pr-2">${row.ex}</div>
                                <div class="w-3/12 pr-2 border-l border-gray-200 pl-2">${row.time}</div>
                                <div class="w-4/12 border-l border-gray-200 pl-2">${row.obs}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="mb-6 border border-gray-300">
                    <div class="bg-[#27ae60] text-white font-bold flex px-3 py-2 text-sm">
                        <div class="w-4/12">2. TREINO PRINCIPAL</div>
                        <div class="w-3/12">Rep/Tempo</div>
                        <div class="w-2/12">Séries</div>
                        <div class="w-3/12">Intervalo</div>
                    </div>
                    <div class="divide-y divide-gray-300">
                        ${plan.principal.map(row => `
                            <div class="flex px-3 py-2 text-sm">
                                <div class="w-4/12 pr-2">${row.ex}</div>
                                <div class="w-3/12 pr-2 border-l border-gray-200 pl-2">${row.rep}</div>
                                <div class="w-2/12 pr-2 border-l border-gray-200 pl-2">${row.ser}</div>
                                <div class="w-3/12 border-l border-gray-200 pl-2">${row.int}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="mb-6 px-2 space-y-1">
                    <p><span class="font-bold uppercase">Intensidade:</span> ${plan.controle.intensidade}</p>
                    <p><span class="font-bold uppercase">Controle:</span> ${plan.controle.texto}</p>
                </div>

                <div class="mb-2 border border-gray-300">
                    <div class="bg-[#8e44ad] text-white font-bold flex px-3 py-2 text-sm">
                        <div class="w-5/12">3. VOLTA À CALMA</div>
                        <div class="w-3/12">Tempo</div>
                        <div class="w-4/12">Observações</div>
                    </div>
                    <div class="divide-y divide-gray-300">
                        ${plan.volta_calma.map(row => `
                            <div class="flex px-3 py-2 text-sm">
                                <div class="w-5/12 pr-2">${row.ex}</div>
                                <div class="w-3/12 pr-2 border-l border-gray-200 pl-2">${row.time}</div>
                                <div class="w-4/12 border-l border-gray-200 pl-2">${row.obs}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

            </div>`;

            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
        function closeModal() { document.getElementById('view-modal').classList.add('hidden'); document.body.style.overflow = 'auto'; }

        document.getElementById('training-form').addEventListener('submit', savePlan);
        showList();