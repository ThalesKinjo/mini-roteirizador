require 'rails_helper'

RSpec.describe Vehicle, type: :model do
  describe 'validações' do
    subject { build(:vehicle) }

    it { should validate_presence_of(:placa) }
    it { should validate_presence_of(:modelo) }
    it { should validate_presence_of(:capacidade) }
    it { should validate_uniqueness_of(:placa) }
    it { should validate_numericality_of(:capacidade).only_integer.is_greater_than(0) }
  end

  describe 'associações' do
    it { should have_many(:addresses).dependent(:nullify) }
  end

  describe 'unicidade da placa' do
    it 'rejeita placa duplicada' do
      create(:vehicle, placa: 'XYZ-9999')
      duplicado = build(:vehicle, placa: 'XYZ-9999')
      expect(duplicado).not_to be_valid
      expect(duplicado.errors[:placa]).to include('has already been taken')
    end
  end

  describe 'capacidade' do
    it 'rejeita capacidade zero' do
      vehicle = build(:vehicle, capacidade: 0)
      expect(vehicle).not_to be_valid
    end

    it 'rejeita capacidade negativa' do
      vehicle = build(:vehicle, capacidade: -5)
      expect(vehicle).not_to be_valid
    end

    it 'rejeita capacidade decimal' do
      vehicle = build(:vehicle, capacidade: 1.5)
      expect(vehicle).not_to be_valid
    end

    it 'aceita capacidade inteira positiva' do
      vehicle = build(:vehicle, capacidade: 100)
      expect(vehicle).to be_valid
    end
  end
end
