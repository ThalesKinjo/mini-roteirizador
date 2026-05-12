class CreateAddresses < ActiveRecord::Migration[7.1]
  def change
    create_table :addresses, id: :uuid, default: "gen_random_uuid()" do |t|
      t.string :rua, null: false
      t.string :numero, null: false
      t.string :cidade, null: false
      t.string :estado, null: false
      t.string :cep, null: false
      t.decimal :latitude, precision: 10, scale: 7
      t.decimal :longitude, precision: 10, scale: 7
      t.string :status, null: false, default: "pendente"
      t.references :vehicle, type: :uuid, null: true, foreign_key: true

      t.timestamps
    end
  end
end
