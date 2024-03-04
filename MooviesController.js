const db = require("../db");

const MooviesController = {
  async findAll(req, res) {
    try {
      const moovies = await db.query(`
        SELECT 
          m.*,
          c.name AS category_name,
          c.description AS category_description
        FROM moovie m 
        INNER JOIN category c ON c.id = m.category_id
      `);

      res.json(moovies.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async find(req, res) {
    const { id } = req.params;

    try {
      const moovies = await db.query(
        `
        SELECT 
          m.*,
          c.name AS category_name,
          c.description AS category_description
        FROM moovie m 
        INNER JOIN category c ON c.id = m.category_id
        WHERE m.id = $1
      `,
        [id]
      );

      if (moovies.rows.length > 0) {
        res.json(moovies.rows[0]);
      } else {
        res.status(404).json({ error: "Filme não encontrado" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    const { title, description, category_id, release_date } = req.body;

    try {
      const categoryCheck = await db.query(
        `SELECT id FROM category WHERE id = $1`,
        [category_id]
      );

      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({ error: "Categoria não encontrada" });
      }

      const newMoovie = await db.query(
        `INSERT INTO moovie (title, description, category_id, release_date)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [title, description, category_id, release_date]
      );

      res.status(201).json(newMoovie.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    const { id } = req.params;

    try {
      const result = await db.query(
        "DELETE FROM moovie WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rowCount > 0) {
        res.status(204).json({});
      } else {
        res.status(304).json({});
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    const { id } = req.params;
    const { title, description, category_id, release_date } = req.body;

    try {
      const result = await db.query(
        `UPDATE moovie 
         SET title = $1, description = $2, category_id = $3, release_date = $4 
         WHERE id = $5 RETURNING *`,
        [title, description, category_id, release_date, id]
      );

      if (result.rowCount > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        res.status(404).json({ error: "Filme não encontrado" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = MooviesController;
