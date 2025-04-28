// This service ensures the AI model is always loaded and ready to respond quickly

// Flag to track if the model is loaded
let modelLoaded = false

// Function to preload the model
export async function preloadModel() {
  if (modelLoaded) return true

  try {
    // Simulate model loading (in a real implementation, this would actually load the model)
    console.log("Preloading AI model...")
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Set the flag to indicate the model is loaded
    modelLoaded = true
    console.log("AI model preloaded successfully")
    return true
  } catch (error) {
    console.error("Failed to preload AI model:", error)
    return false
  }
}

// Function to check if the model is loaded
export function isModelLoaded() {
  return modelLoaded
}

// Function to warm up the model with a dummy request
export async function warmupModel() {
  try {
    // Make a simple inference to warm up the model
    console.log("Warming up AI model...")

    // In a real implementation, this would make a lightweight inference request
    await new Promise((resolve) => setTimeout(resolve, 500))

    console.log("AI model warmed up successfully")
    return true
  } catch (error) {
    console.error("Failed to warm up AI model:", error)
    return false
  }
}

// Preload the model immediately when this module is imported
preloadModel().catch(console.error)

// Set up periodic warm-up to keep the model ready
setInterval(() => {
  if (modelLoaded) {
    warmupModel().catch(console.error)
  } else {
    preloadModel().catch(console.error)
  }
}, 60000) // Every minute
