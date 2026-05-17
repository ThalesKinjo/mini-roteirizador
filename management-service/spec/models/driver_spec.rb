require 'rails_helper'

RSpec.describe Driver, type: :model do
  describe 'validações' do
    subject { build(:driver) }

    it { should validate_presence_of(:nome) }
    it { should validate_presence_of(:cpf) }
    it { should validate_uniqueness_of(:cpf).ignoring_case_sensitivity }
  end

  describe 'formato do CPF' do
    it 'aceita CPF no formato correto' do
      driver = build(:driver)
      expect(driver).to be_valid
    end

    it 'rejeita CPF sem formatação (só dígitos)' do
      driver = build(:driver, cpf: '12345678900')
      expect(driver).not_to be_valid
      expect(driver.errors[:cpf]).to include('deve estar no formato 000.000.000-00')
    end

    it 'rejeita CPF com formatação parcial (sem hífen)' do
      driver = build(:driver, cpf: '123.456.78900')
      expect(driver).not_to be_valid
    end

    it 'rejeita CPF com separadores errados' do
      driver = build(:driver, cpf: '123-456-789.00')
      expect(driver).not_to be_valid
    end

    it 'rejeita CPF incompleto' do
      driver = build(:driver, cpf: '123.456.789')
      expect(driver).not_to be_valid
    end
  end

  describe 'unicidade do CPF' do
    it 'rejeita CPF duplicado' do
      create(:driver, cpf: '111.222.333-44')
      duplicado = build(:driver, cpf: '111.222.333-44')
      expect(duplicado).not_to be_valid
      expect(duplicado.errors[:cpf]).to include('has already been taken')
    end
  end
end
