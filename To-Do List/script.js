// ======================
// ELEMENT
// ======================

const taskInput = document.getElementById("task");
const priority = document.getElementById("priority");
const deadline = document.getElementById("deadline");

const addBtn = document.getElementById("addBtn");
const deleteAllBtn = document.getElementById("deleteAll");

const todoList = document.getElementById("todoList");
const doneList = document.getElementById("doneList");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ======================
// TANGGAL
// ======================

const hari = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu"
];

const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
];

const now = new Date();

document.getElementById("day").textContent =
    hari[now.getDay()];

document.getElementById("today").textContent =
    `${now.getDate()} ${bulan[now.getMonth()]} ${now.getFullYear()}`;

// ======================
// SIMPAN LOCAL STORAGE
// ======================

function saveData() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ======================
// CEK OVERDUE
// ======================

function isOverdue(deadline) {

    if (!deadline) return false;

    const today = new Date();
    today.setHours(0,0,0,0);

    const due = new Date(deadline);
    due.setHours(0,0,0,0);

    return due < today;

}

// ======================
// TAMBAH TASK
// ======================

addBtn.addEventListener("click", () => {

    if (taskInput.value.trim() === "") {
        alert("Masukkan tugas!");
        return;
    }

    tasks.push({

        id: Date.now(),

        task: taskInput.value,

        priority: priority.value,

        deadline: deadline.value,

        created: new Date().toLocaleDateString("id-ID"),

        done: false

    });

    saveData();

    render();

    taskInput.value = "";
    deadline.value = "";

});

// ======================
// TAMPILKAN TASK
// ======================

function render() {

    todoList.innerHTML = "";
    doneList.innerHTML = "";

    tasks.forEach(item => {

        const div = document.createElement("div");

        div.className = item.done ? "task done" : "task";

        div.innerHTML = `

        <div style="display:flex;">

            <input
                type="checkbox"
                ${item.done ? "checked" : ""}
                onchange="toggleTask(${item.id})">

            <div class="task-info">

                <h3>${item.task}</h3>

                <p class="priority ${item.priority.toLowerCase()}">
                    Priority : ${item.priority}
                </p>

                <p>
                    Dibuat : ${item.created}
                </p>

                <p>
                    Deadline : ${item.deadline || "-"}
                </p>

                ${
                    isOverdue(item.deadline) && !item.done
                    ? `<p class="overdue">🔴 OVERDUE</p>`
                    : ""
                }

            </div>

        </div>

        <button
            class="delete-btn"
            onclick="deleteTask(${item.id})">
            Delete
        </button>

        `;

        if(item.done){

            doneList.appendChild(div);

        }else{

            todoList.appendChild(div);

        }

    });

}

// ======================
// CHECKBOX
// ======================

function toggleTask(id){

    tasks.forEach(task=>{

        if(task.id===id){

            task.done=!task.done;

        }

    });

    saveData();

    render();

}

// ======================
// DELETE
// ======================

function deleteTask(id){

    tasks=tasks.filter(task=>task.id!==id);

    saveData();

    render();

}

// ======================
// DELETE ALL
// ======================

deleteAllBtn.addEventListener("click",()=>{

    if(confirm("Hapus semua task?")){

        tasks=[];

        saveData();

        render();

    }

});

// ======================
// LOAD
// ======================

render();