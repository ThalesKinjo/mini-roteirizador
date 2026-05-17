FactoryBot.define do
  factory :vehicle do
    sequence(:placa) { |n| "ABC-#{n.to_s.rjust(4, '0')}" }
    modelo { "Fiorino" }
    capacidade { 10 }
  end
end
