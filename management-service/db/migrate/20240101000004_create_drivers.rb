class CreateDrivers < ActiveRecord::Migration[7.1]
  def change
    create_table :drivers, id: :uuid, default: "gen_random_uuid()" do |t|
      t.string :nome, null: false
      t.string :cpf, null: false

      t.timestamps
    end

    add_index :drivers, :cpf, unique: true
  end
end
