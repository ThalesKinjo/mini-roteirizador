FactoryBot.define do
  factory :driver do
    nome { "João Silva" }
    sequence(:cpf) { |n| "#{n.to_s.rjust(3, '0')}.456.789-00" }
  end
end
