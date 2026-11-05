const mongoose = require('mongoose');
const { createHybridModel } = require('./dbHelper');

const recipeSchema = new mongoose.Schema({
  dishId: { type: String, required: true },
  dishName: { type: String, required: true },
  prepTime: { type: String, default: '25 phút' },
  difficulty: { type: String, default: 'Dễ' },
  calories: { type: String, default: '450 kcal' },
  ingredients: { type: [String], default: [] },
  steps: { type: [String], default: [] },
  tips: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const MongooseRecipe = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);

module.exports = createHybridModel('Recipe', MongooseRecipe, {
  prepTime: '25 phút',
  difficulty: 'Dễ',
  calories: '450 kcal',
  ingredients: [],
  steps: [],
  tips: ''
});
