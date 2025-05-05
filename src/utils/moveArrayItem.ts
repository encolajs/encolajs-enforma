export default function (array: [any], fromIndex: number, toIndex: number) {
  // --- Validation ---
  if (!Array.isArray(array)) {
    console.error('Error: Provided argument is not an array.')
    return undefined // Or throw new Error(...)
  }

  const len = array.length
  if (fromIndex < 0 || fromIndex >= len) {
    return array
  }

  if (toIndex < 0) {
    toIndex = 0
  }

  if (toIndex > len) {
    toIndex = len
  }

  // If indices are the same, no move needed
  if (fromIndex === toIndex) {
    return array
  }

  // --- Move Logic ---

  // 1. Store the element to move
  const elementToMove = array[fromIndex]

  // 2. Shift elements
  if (fromIndex < toIndex) {
    // Moving DOWN (towards the end): Shift elements LEFT
    // Example: Move index 1 to 3 in [A, B, C, D, E]
    // Target: [A, C, D, B, E]
    // Shift C (index 2) to index 1
    // Shift D (index 3) to index 2
    for (let i = fromIndex; i < toIndex; i++) {
      array[i] = array[i + 1]
    }
  } else {
    // fromIndex > toIndex
    // Moving UP (towards the beginning): Shift elements RIGHT
    // Example: Move index 3 to 1 in [A, B, C, D, E]
    // Target: [A, D, B, C, E]
    // Shift C (index 2) to index 3
    // Shift B (index 1) to index 2
    for (let i = fromIndex; i > toIndex; i--) {
      array[i] = array[i - 1]
    }
  }

  // 3. Place the element at the target index
  array[toIndex] = elementToMove

  return array
}
