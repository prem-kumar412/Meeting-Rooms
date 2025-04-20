// === MeetingRoom Class ===
class MeetingRoom {
  constructor(id) {
    this.id = id;
    this.isOccupied = false;
    this.meetingName = '';
    this.capacity = 0;
    this.attendees = new Set();
  }

  enter(employeeId, name, capacity) {
    if (!this.isOccupied) {
      this.isOccupied = true;
      this.meetingName = name;
      this.capacity = capacity;
      this.attendees.add(employeeId);
      return true;
    } else if (this.attendees.size < this.capacity) {
      this.attendees.add(employeeId);
      return true;
    }
    return false;
  }

  leave(employeeId) {
    if (this.attendees.has(employeeId)) {
      this.attendees.delete(employeeId);
      if (this.attendees.size === 0) this.reset();
      return true;
    }
    return false;
  }

  reset() {
    this.isOccupied = false;
    this.meetingName = '';
    this.capacity = 0;
    this.attendees.clear();
  }

  isVacant() {
    return !this.isOccupied;
  }
}

// === Office Class ===
class Office {
  constructor() {
    this.rooms = Array.from({ length: 15 }, (_, i) => new MeetingRoom(i + 1));
    this.employeeMap = new Map(); // employeeId -> roomId
  }

  enterRoom(empId, roomId, name, capacity) {
    if (this.employeeMap.has(empId)) {
      return `Employee ${empId} is already in a room.`;
    }

    const room = this.rooms[roomId - 1];
    const success = room.enter(empId, name, capacity);
    if (success) {
      this.employeeMap.set(empId, roomId);
      return `Employee ${empId} entered Room ${roomId}.`;
    }
    return `Room ${roomId} is full or unavailable.`;
  }

  leaveRoom(empId) {
    if (!this.employeeMap.has(empId)) {
      return `Employee ${empId} is not in any room.`;
    }

    const roomId = this.employeeMap.get(empId);
    const room = this.rooms[roomId - 1];
    room.leave(empId);
    this.employeeMap.delete(empId);
    return `Employee ${empId} left Room ${roomId}.`;
  }

  getVacantRooms() {
    return this.rooms.filter(r => r.isVacant()).map(r => r.id);
  }

  getOccupiedRooms() {
    return this.rooms
      .filter(r => !r.isVacant())
      .map(r => ({
        id: r.id,
        name: r.meetingName,
        attendees: [...r.attendees],
        capacity: r.capacity
      }));
  }
}

const office = new Office();

// === UI Functions ===
function enterRoom() {
  const empId = parseInt(document.getElementById("employeeId").value);
  const roomId = parseInt(document.getElementById("roomId").value);
  const meetingName = document.getElementById("meetingName").value.trim();
  const capacity = parseInt(document.getElementById("capacity").value);

  if (isNaN(empId) || isNaN(roomId) || !meetingName || isNaN(capacity)) {
    alert("Please fill in all fields correctly.");
    return;
  }

  const result = office.enterRoom(empId, roomId, meetingName, capacity);
  alert(result);
  updateDisplay();
}

function leaveRoom() {
  const empId = parseInt(document.getElementById("leaveEmployeeId").value);

  if (isNaN(empId)) {
    alert("Please enter a valid Employee ID.");
    return;
  }

  const result = office.leaveRoom(empId);
  alert(result);
  updateDisplay();
}

function updateDisplay() {
  const vacantDiv = document.getElementById("vacantRooms");
  const occupiedDiv = document.getElementById("occupiedRooms");

  // Render Vacant Rooms
  const vacantRooms = office.getVacantRooms();
  vacantDiv.innerHTML = vacantRooms.length === 0
    ? `<p class="text-muted">No vacant rooms currently.</p>`
    : vacantRooms.map(id => `<div class="room-card">Room ${id}</div>`).join('');

  // Render Occupied Rooms
  const occupiedRooms = office.getOccupiedRooms();
  occupiedDiv.innerHTML = occupiedRooms.length === 0
    ? `<p class="text-muted">No occupied rooms currently.</p>`
    : occupiedRooms.map(r =>
        `<div class="occupied-room">
           <strong>Room ${r.id}</strong> - ${r.name}<br>
           Capacity: ${r.capacity}<br>
           Attendees: ${r.attendees.join(', ')}
         </div>`
      ).join('');
}

// Initial call
updateDisplay();
