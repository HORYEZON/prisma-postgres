try {
    require('@testing-library/jest-dom/extend-expect')
} catch (err) {
    console.log('jest-dom not loaded (probably running node env test)')
}
