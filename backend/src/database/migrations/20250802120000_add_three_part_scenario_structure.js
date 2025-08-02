/**
 * Migration to implement 3-part scenario structure as required by PRD Section 4.1.1
 * Adds confidential role instructions and teaching notes to scenarios
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('scenarios', function(table) {
    // Role 1: Human user confidential instructions (context, interests, resources)
    table.text('role1_instructions').nullable().comment('Confidential instructions for human user - context, interests, resources')
    
    // Role 2: AI character confidential instructions (context, interests, resources)  
    table.text('role2_instructions').nullable().comment('Confidential instructions for AI character - context, interests, resources')
    
    // Teaching notes: Key concepts, learning outcomes, complexity level
    table.text('teaching_notes').nullable().comment('Teaching notes with key concepts, learning outcomes, complexity level')
    
    // Add indexes for performance
    table.index(['id', 'is_active'])
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('scenarios', function(table) {
    table.dropColumn('role1_instructions')
    table.dropColumn('role2_instructions') 
    table.dropColumn('teaching_notes')
    table.dropIndex(['id', 'is_active'])
  })
}