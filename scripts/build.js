// scripts/build.js
const fs = require('fs')
const path = require('path')

console.log('🏗️  Post-build processing...')

try {
    // Check if express.d.ts exists in src and copy to lib
    const srcExpressTypes = path.join(__dirname, '../src/express.d.ts')
    const destExpressTypes = path.join(__dirname, '../lib/express.d.ts')

    if (fs.existsSync(srcExpressTypes)) {
        try {
            fs.copyFileSync(srcExpressTypes, destExpressTypes)
            console.log('✅ Copied express.d.ts to lib/')
        } catch (error) {
            console.log('⚠️  Could not copy express.d.ts:', error.message)
        }
    }

    // Check if lib directory exists and has files
    const libDir = path.join(__dirname, '../lib')
    if (fs.existsSync(libDir)) {
        const files = fs.readdirSync(libDir)
        console.log(`✅ Build completed! Generated ${files.length} files in lib/`)
    } else {
        console.log('⚠️  Warning: lib directory not found')
    }

} catch (error) {
    console.log('⚠️  Post-build processing failed:', error.message)
    // Don't fail the build for post-processing errors
}

console.log('🎉 Build process finished!')