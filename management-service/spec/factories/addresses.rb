FactoryBot.define do
  factory :address do
    rua { "Rua Teste" }
    numero { "123" }
    cidade { "Campo Grande" }
    estado { "MS" }
    cep { "79000-000" }
    latitude { -20.4697 }
    longitude { -54.6201 }
    status { "pendente" }
    vehicle { nil }
  end
end
