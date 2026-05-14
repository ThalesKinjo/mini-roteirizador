class Address < ApplicationRecord
  belongs_to :vehicle, optional: true

  VALID_STATUSES = %w[pendente em_rota entregue].freeze

  validates :rua, :cidade, :estado, presence: true
  validates :status, inclusion: { in: VALID_STATUSES }
  validates :latitude, :longitude, presence: true, numericality: true

  before_validation :set_default_status

  def as_json(options = {})
    super(options).tap { |h| h["veiculo_id"] = h.delete("vehicle_id") }
  end

  private

  def set_default_status
    self.status ||= "pendente"
    self.numero = "" if numero.nil?
    self.cep = "" if cep.nil?
  end
end
