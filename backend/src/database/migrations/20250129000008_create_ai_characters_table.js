exports.up = function (knex) {
  return knex.schema.createTable('ai_characters', function (table) {
    table.string('id').primary()
    table.string('name').notNullable()
    table.text('description').notNullable()
    table.string('role').notNullable() // 'buyer', 'seller', 'mediator', etc.
    table.text('personality_profile').notNullable() // JSON string - Big 5 traits, negotiation style
    table.text('behavior_parameters').notNullable() // JSON string - Aggressiveness, patience, flexibility
    table.text('interests_template').notNullable() // JSON string - Core interests for scenarios
    table.decimal('batna_range_min', 10, 2) // Minimum acceptable outcome
    table.decimal('batna_range_max', 10, 2) // Maximum acceptable outcome
    table.text('communication_style').notNullable() // Language patterns, formality
    table.text('negotiation_tactics').notNullable() // JSON string - Preferred tactics and strategies
    table.boolean('is_active').defaultTo(true)
    table.timestamps(true, true)
    
    table.index(['role'])
    table.index(['is_active'])
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('ai_characters')
}