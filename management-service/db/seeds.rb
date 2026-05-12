puts "Criando veículos..."
vehicles = [
  { placa: "ABC-1234", capacidade: 50, modelo: "Fiat Fiorino" },
  { placa: "DEF-5678", capacidade: 100, modelo: "Volkswagen Delivery" },
  { placa: "GHI-9012", capacidade: 30, modelo: "Renault Kangoo" }
]

created_vehicles = vehicles.map { |v| Vehicle.find_or_create_by!(placa: v[:placa]) { |veh| veh.assign_attributes(v) } }

puts "Criando motoristas..."
drivers = [
  { nome: "João Silva", cpf: "123.456.789-00" },
  { nome: "Maria Souza", cpf: "987.654.321-00" },
  { nome: "Pedro Oliveira", cpf: "456.789.123-00" }
]

drivers.each { |d| Driver.find_or_create_by!(cpf: d[:cpf]) { |drv| drv.nome = d[:nome] } }

puts "Criando endereços..."
addresses = [
  { rua: "Rua das Flores", numero: "100", cidade: "Campo Grande", estado: "MS", cep: "79000-100", latitude: -20.4697, longitude: -54.6201 },
  { rua: "Av. Afonso Pena", numero: "2500", cidade: "Campo Grande", estado: "MS", cep: "79010-000", latitude: -20.4781, longitude: -54.6147 },
  { rua: "Rua Dom Aquino", numero: "350", cidade: "Campo Grande", estado: "MS", cep: "79002-180", latitude: -20.4633, longitude: -54.6128 },
  { rua: "Av. Mato Grosso", numero: "1200", cidade: "Campo Grande", estado: "MS", cep: "79031-050", latitude: -20.4850, longitude: -54.6050 },
  { rua: "Rua 14 de Julho", numero: "75", cidade: "Campo Grande", estado: "MS", cep: "79003-010", latitude: -20.4610, longitude: -54.6180 },
  { rua: "Av. Fernando Correa da Costa", numero: "600", cidade: "Campo Grande", estado: "MS", cep: "79050-000", latitude: -20.4720, longitude: -54.6300 }
]

addresses.each { |a| Address.find_or_create_by!(rua: a[:rua], numero: a[:numero]) { |addr| addr.assign_attributes(a) } }

puts "Seeds concluídos!"
