require 'rails_helper'

RSpec.describe Address, type: :model do
  describe 'validações' do
    subject { build(:address) }

    it { should validate_presence_of(:rua) }
    it { should validate_presence_of(:cidade) }
    it { should validate_presence_of(:estado) }
    it { should validate_presence_of(:latitude) }
    it { should validate_presence_of(:longitude) }
    it { should validate_numericality_of(:latitude) }
    it { should validate_numericality_of(:longitude) }
    it { should validate_inclusion_of(:status).in_array(%w[pendente em_rota entregue]) }
  end

  describe 'associações' do
    it { should belong_to(:vehicle).optional }
  end

  describe 'status padrão' do
    it 'define status como pendente quando não informado' do
      address = build(:address, status: nil)
      address.valid?
      expect(address.status).to eq('pendente')
    end

    it 'mantém o status informado quando válido' do
      address = build(:address, status: 'em_rota')
      expect(address).to be_valid
      expect(address.status).to eq('em_rota')
    end

    it 'rejeita status inválido' do
      address = build(:address, status: 'invalido')
      expect(address).not_to be_valid
      expect(address.errors[:status]).to be_present
    end
  end

  describe '#as_json' do
    it 'expõe veiculo_id em vez de vehicle_id' do
      address = build(:address)
      json = address.as_json
      expect(json).to have_key('veiculo_id')
      expect(json).not_to have_key('vehicle_id')
    end
  end

  describe 'campos opcionais' do
    it 'é válido sem número' do
      address = build(:address, numero: nil)
      address.valid?
      expect(address.numero).to eq('')
    end

    it 'é válido sem cep' do
      address = build(:address, cep: nil)
      address.valid?
      expect(address.cep).to eq('')
    end
  end
end
