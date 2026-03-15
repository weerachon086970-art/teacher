document.addEventListener('DOMContentLoaded', () => {
    const studentForm = document.getElementById('student-form');
    const studentTableBody = document.getElementById('student-body');
    const studentModal = document.getElementById('student-modal');
    const addStudentBtn = document.getElementById('add-student-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const searchInput = document.getElementById('student-search');
    
    // Stats elements
    const totalStudentsEl = document.getElementById('total-students');
    const averageScoreEl = document.getElementById('average-score');

    let students = JSON.parse(localStorage.getItem('thaiScores_students')) || [];
    let currentEditId = null;

    // --- State Management ---
    
    const saveToLocalStorage = () => {
        localStorage.setItem('thaiScores_students', JSON.stringify(students));
        updateDashboard();
    };

    const calculateGrade = (total) => {
        if (total >= 80) return '4';
        if (total >= 75) return '3.5';
        if (total >= 70) return '3';
        if (total >= 65) return '2.5';
        if (total >= 60) return '2';
        if (total >= 55) return '1.5';
        if (total >= 50) return '1';
        return '0';
    };

    const getGradeClass = (grade) => {
        const g = parseFloat(grade);
        if (g >= 3.5) return 'grade-4';
        if (g >= 2.5) return 'grade-3';
        if (g >= 1.5) return 'grade-2';
        if (g >= 1.0) return 'grade-1';
        return 'grade-0';
    };

    // --- UI/DOM Rendering ---

    const renderStudents = (filter = '') => {
        studentTableBody.innerHTML = '';
        
        const filteredStudents = students.filter(s => 
            s.name.toLowerCase().includes(filter.toLowerCase()) || 
            s.no.toString().includes(filter)
        );

        // Sort by student number
        filteredStudents.sort((a, b) => parseInt(a.no) - parseInt(b.no));

        filteredStudents.forEach(student => {
            const total = parseInt(student.reading) + 
                          parseInt(student.writing) + 
                          parseInt(student.listening) + 
                          parseInt(student.literature) + 
                          parseInt(student.grammar);
            
            const grade = calculateGrade(total);
            const gradeClass = getGradeClass(grade);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.no}</td>
                <td><strong>${student.name}</strong></td>
                <td>${student.reading}</td>
                <td>${student.writing}</td>
                <td>${student.listening}</td>
                <td>${student.literature}</td>
                <td>${student.grammar}</td>
                <td class="total-score">${total}</td>
                <td><span class="grade-badge ${gradeClass}">${grade}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon btn-edit" data-id="${student.id}" title="แก้ไข">✏️</button>
                        <button class="btn-icon btn-delete" data-id="${student.id}" title="ลบ">🗑️</button>
                    </div>
                </td>
            `;
            studentTableBody.appendChild(row);
        });

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.onclick = () => editStudent(btn.getAttribute('data-id'));
        });
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.onclick = () => deleteStudent(btn.getAttribute('data-id'));
        });
    };

    const updateDashboard = () => {
        totalStudentsEl.innerText = students.length;
        
        if (students.length === 0) {
            averageScoreEl.innerText = '0.0';
            return;
        }

        const sum = students.reduce((acc, s) => {
            return acc + (parseInt(s.reading) + parseInt(s.writing) + parseInt(s.listening) + parseInt(s.literature) + parseInt(s.grammar));
        }, 0);
        
        averageScoreEl.innerText = (sum / students.length).toFixed(1);
    };

    // --- Actions ---

    const openModal = (title = 'เพิ่มข้อมูลนักเรียน', student = null) => {
        document.getElementById('modal-title').innerText = title;
        if (student) {
            document.getElementById('student-id').value = student.id;
            document.getElementById('student-no').value = student.no;
            document.getElementById('student-name').value = student.name;
            document.getElementById('score-reading').value = student.reading;
            document.getElementById('score-writing').value = student.writing;
            document.getElementById('score-listening').value = student.listening;
            document.getElementById('score-literature').value = student.literature;
            document.getElementById('score-grammar').value = student.grammar;
            currentEditId = student.id;
        } else {
            studentForm.reset();
            document.getElementById('student-id').value = '';
            currentEditId = null;
        }
        studentModal.style.display = 'block';
    };

    const closeModal = () => {
        studentModal.style.display = 'none';
        studentForm.reset();
    };

    const deleteStudent = (id) => {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนักเรียนคนนี้?')) {
            students = students.filter(s => s.id !== id);
            saveToLocalStorage();
            renderStudents(searchInput.value);
        }
    };

    const editStudent = (id) => {
        const student = students.find(s => s.id === id);
        if (student) {
            openModal('แก้ไขข้อมูลนักเรียน', student);
        }
    };

    // --- Event Listeners ---

    addStudentBtn.onclick = () => openModal();

    closeModalBtns.forEach(btn => {
        btn.onclick = closeModal;
    });

    window.onclick = (event) => {
        if (event.target === studentModal) {
            closeModal();
        }
    };

    searchInput.addEventListener('input', (e) => {
        renderStudents(e.target.value);
    });

    studentForm.onsubmit = (e) => {
        e.preventDefault();
        
        const studentData = {
            id: currentEditId || Date.now().toString(),
            no: document.getElementById('student-no').value,
            name: document.getElementById('student-name').value,
            reading: document.getElementById('score-reading').value,
            writing: document.getElementById('score-writing').value,
            listening: document.getElementById('score-listening').value,
            literature: document.getElementById('score-literature').value,
            grammar: document.getElementById('score-grammar').value
        };

        if (currentEditId) {
            // Update existing
            const index = students.findIndex(s => s.id === currentEditId);
            students[index] = studentData;
        } else {
            // Add new
            students.push(studentData);
        }

        saveToLocalStorage();
        renderStudents(searchInput.value);
        closeModal();
    };

    // Initialize
    renderStudents();
    updateDashboard();
});
