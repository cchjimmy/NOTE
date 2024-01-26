!function main() {
  const list = document.querySelector("#list");
  const content = document.querySelector("#content");
  const create = document.querySelector("#new-note");
  const remove = document.querySelector("#remove-note");
  const save = document.querySelector("#save-note");
  const editTitle = document.querySelector("#change-title");
  const titleDialog = document.querySelector("dialog");
  const confirmTitle = titleDialog.querySelector("#confirm-title");
  const titleInput = titleDialog.querySelector("#new-title");
  const sidebarToggle = document.querySelector("#sidebar-toggle");

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const notes = [];
  const nPool = [];
  const idPool = [];
  var tranotesition = false;

  fetchNotes(notes);
  sortNotesByDate(notes);
  listNotes(notes);

  var activeNote;
  activeNote = notes[0] ??= createNote();

  display(activeNote);

  addHeader(activeNote).classList.add("active-note");

  create.onclick = (e) => {
    e.preventDefault();
    let note = createNote();
    notes.unshift(note);
    list.insertAdjacentElement("afterbegin", addHeader(note));
  };

  remove.onclick = (e) => {
    e.preventDefault();
    for (let i = 0; i < notes.length; ++i) {
      if (notes[i].id != activeNote.id) continue;
      nPool.push(notes.splice(i, 1)[0]);
      break;
    }
    deleteNote(activeNote);
    deactive(activeNote);
    hide(activeNote);
    activeNote = notes[0] ??= createNote();
    addHeader(activeNote);
    setActive(activeNote);
    tranotesition = true;
  };

  save.onclick = (e) => {
    e.preventDefault();
    saveNote(activeNote);
    sortNotesByDate(notes);
    list.insertAdjacentElement("afterbegin", addHeader(activeNote));
  };

  editTitle.onclick = (e) => {
    e.preventDefault();
    titleDialog.showModal();
    titleInput.value = activeNote.title;
  };

  confirmTitle.onclick = (e) => {
    e.preventDefault();
    titleDialog.close();
    if (activeNote.title != titleInput.value) {
      activeNote.modified = true;
      changeTitle(activeNote, titleInput.value);
    }
    titleInput.value = null;
  };

  sidebarToggle.onclick = (e) => {
    e.preventDefault();
    list.style.display = list.style.display == "block" ? "none" : "block";
  };

  const deferBuffering = debounce(
    () => {
      activeNote.content = content.innerHTML;
    },
  );

  const observer = new MutationObserver(() => {
    deferBuffering();
    if (activeNote.modified) return;
    if (tranotesition) {
      tranotesition = false;
      return;
    }
    activeNote.modified = true;
    addHeader(activeNote);
  });

  observer.observe(content, {
    "characterData": true,
    "subtree": true,
    "childList": true,
  });

  function addHeader(note) {
    let noteHeader = document.getElementById(note.id);
    if (!noteHeader) {
      noteHeader = document.createElement("li");
      list.insertAdjacentElement("afterbegin", noteHeader);
    }
    noteHeader.style.display = "block";
    noteHeader.id = note.id;
    noteHeader.classList.add("outlined");
    let time = new Date(note.time);
    let min = time.getMinutes();
    let sec = time.getSeconds();
    let hr = time.getHours();
    noteHeader.innerHTML = `${note.modified ? "*" : ""
      }${note.title}<br>${time.getFullYear()}-${MONTHS[time.getMonth()]
      }-${time.getDate()}<br>${hr < 10 ? "0" + hr : hr}:${min < 10 ? "0" + min : min
      }:${sec < 10 ? "0" + sec : sec}`;
    noteHeader.onclick = () => {
      deactive(activeNote);
      setActive(note);
      activeNote = note;
      tranotesition = true;
    };
    return noteHeader;
  }

  function changeTitle(note, title) {
    note.title = title;
    addHeader(note);
  }

  function throttle(cb, delay = 300) {
    let shouldWait = false;
    let waitingArgs;
    function timeoutFn() {
      shouldWait = false;
      if (!waitingArgs) return;
      shouldWait = true;
      cb(...waitingArgs);
      waitingArgs = null;
      setTimeout(timeoutFn, delay);
    }
    return (...args) => {
      waitingArgs = args;
      if (shouldWait) return;
      cb(...args);
      shouldWait = true;
      setTimeout(timeoutFn, delay);
    };
  }

  function debounce(cb, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => cb(...args), delay);
    };
  }

  function getSelection() {
    return document.getSelection();
  }

  function saveNote(note) {
    note.time = new Date().getTime();
    note.modified = false;
    note.content = note.content;
    localStorage.setItem(note.id, JSON.stringify(note));
  }

  function createNote() {
    let note = nPool.pop() ?? {};
    note.title = "New note";
    note.id ??= idPool.pop() ?? random64();
    note.time = new Date().getTime();
    note.content = "";
    note.modified = false;
    return note;
  }

  function deleteNote(note) {
    localStorage.removeItem(note.id);
  }

  function copyNote(src, dest) {
    dest.title = src.title;
    dest.content = src.content;
    dest.time = src.time;
    dest.modified = src.modified;
  }

  function removeHeader(note) {
    document.getElementById(note.id).remove();
  }

  function hide(note) {
    document.getElementById(note.id).style.display = "none";
  }

  function random64() {
    return parseInt(Math.random() * (2 ** 64));
  }

  function setActive(note) {
    document.getElementById(note.id).classList.add("active-note");
    display(note);
  }

  function deactive(note) {
    document.getElementById(note.id).classList.remove("active-note");
  }

  function display(note) {
    content.innerHTML = note.content;
  }

  function fetchNotes(notes) {
    notes.splice(0);
    const l = localStorage.length;
    for (let i = 0; i < l; ++i) {
      notes[i] = JSON.parse(localStorage.getItem(localStorage.key(i)));
    }
    return notes;
  }

  function listNotes(notes) {
    const l = notes.length;
    for (let i = l - 1; i >= 0; --i) {
      addHeader(notes[i]);
    }
  }

  function sortNotesByDate(notes) {
    return notes.sort((a, b) => b.time - a.time);
  }
}();
