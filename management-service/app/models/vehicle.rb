class Vehicle < ApplicationRecord
  has_many :addresses, dependent: :nullify

  validates :placa, presence: true, uniqueness: true
  validates :capacidade, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :modelo, presence: true
end
