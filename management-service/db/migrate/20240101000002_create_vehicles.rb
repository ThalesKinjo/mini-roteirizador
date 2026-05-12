class CreateVehicles < ActiveRecord::Migration[7.1]
  def change
    create_table :vehicles, id: :uuid, default: "gen_random_uuid()" do |t|
      t.string :placa, null: false
      t.integer :capacidade, null: false
      t.string :modelo, null: false

      t.timestamps
    end

    add_index :vehicles, :placa, unique: true
  end
end
