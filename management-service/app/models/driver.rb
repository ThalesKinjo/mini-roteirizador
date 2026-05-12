class Driver < ApplicationRecord
  validates :nome, presence: true
  validates :cpf, presence: true, uniqueness: true, format: {
    with: /\A\d{3}\.\d{3}\.\d{3}-\d{2}\z/,
    message: "deve estar no formato 000.000.000-00"
  }
end
