class Address < ApplicationRecord
  belongs_to :vehicle, optional: true

  VALID_STATUSES = %w[pendente em_rota entregue].freeze

  validates :rua, :numero, :cidade, :estado, :cep, presence: true
  validates :status, inclusion: { in: VALID_STATUSES }
  validates :latitude, :longitude, numericality: true, allow_nil: true

  before_validation :set_default_status

  private

  def set_default_status
    self.status ||= "pendente"
  end
end
