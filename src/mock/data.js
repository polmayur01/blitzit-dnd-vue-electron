export const boards = [
  { id: 'b1', title: 'Personal' },
  { id: 'b2', title: 'Work' },
  { id: 'b3', title: 'Ideas' }
]

export const sections = ['Backlog', 'Scheduled', 'In Progress', 'Done']

function makeTask(i, boardId, section, position, long = false) {
  const title = long
    ? `Task ${i}: very long title to test uneven card heights and wrapping`
    : `Task ${i}`
  return {
    id: `t${i}`,
    title,
    position,
    boardId,
    section
  }
}

export const tasks = [
  makeTask(1, 'b2', 'Scheduled', 250),
  makeTask(2, 'b2', 'Backlog', 250),
  makeTask(3, 'b1', 'In Progress', 250, true),

  ...Array.from({ length: 50 }, (_, k) =>
    makeTask(
      100 + k,
      'b3',
      'Backlog',
      250 + k * 5,
      k % 4 === 0 
    )
  )
]
