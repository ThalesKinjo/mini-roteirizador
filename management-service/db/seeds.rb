puts "Criando veículos..."
vehicles = [
  { placa: "ABC-1234", capacidade: 50,  modelo: "Fiat Fiorino" },
  { placa: "DEF-5678", capacidade: 100, modelo: "Volkswagen Delivery" },
  { placa: "GHI-9012", capacidade: 30,  modelo: "Renault Kangoo" },
  { placa: "JKL-3456", capacidade: 80,  modelo: "Ford Transit" },
  { placa: "MNO-7890", capacidade: 150, modelo: "Mercedes Sprinter" },
  { placa: "PQR-1122", capacidade: 20,  modelo: "Fiat Uno Furgão" }
]

vehicles.each { |v| Vehicle.find_or_create_by!(placa: v[:placa]) { |veh| veh.assign_attributes(v) } }

puts "Criando motoristas..."
drivers = [
  { nome: "João Silva",        cpf: "123.456.789-00" },
  { nome: "Maria Souza",       cpf: "987.654.321-00" },
  { nome: "Pedro Oliveira",    cpf: "456.789.123-00" },
  { nome: "Ana Costa",         cpf: "321.654.987-11" },
  { nome: "Carlos Mendes",     cpf: "741.852.963-22" },
  { nome: "Fernanda Lima",     cpf: "159.753.486-33" },
  { nome: "Rafael Santos",     cpf: "258.369.147-44" },
  { nome: "Juliana Pereira",   cpf: "963.852.741-55" }
]

drivers.each { |d| Driver.find_or_create_by!(cpf: d[:cpf]) { |drv| drv.nome = d[:nome] } }

puts "Criando endereços..."
addresses = [
  # Centro
  { rua: "Av. Afonso Pena",              numero: "2500", cidade: "Campo Grande", estado: "MS", cep: "79010-000", latitude: -20.4781, longitude: -54.6147 },
  { rua: "Rua Dom Aquino",               numero: "350",  cidade: "Campo Grande", estado: "MS", cep: "79002-180", latitude: -20.4633, longitude: -54.6128 },
  { rua: "Rua 14 de Julho",              numero: "75",   cidade: "Campo Grande", estado: "MS", cep: "79003-010", latitude: -20.4610, longitude: -54.6180 },
  { rua: "Rua Barão do Rio Branco",      numero: "1100", cidade: "Campo Grande", estado: "MS", cep: "79005-200", latitude: -20.4668, longitude: -54.6095 },
  { rua: "Rua Joaquim Murtinho",         numero: "540",  cidade: "Campo Grande", estado: "MS", cep: "79004-330", latitude: -20.4650, longitude: -54.6220 },
  # Zona norte
  { rua: "Av. Mato Grosso",             numero: "1200", cidade: "Campo Grande", estado: "MS", cep: "79031-050", latitude: -20.4850, longitude: -54.6050 },
  { rua: "Rua das Flores",              numero: "100",  cidade: "Campo Grande", estado: "MS", cep: "79000-100", latitude: -20.4697, longitude: -54.6201 },
  { rua: "Av. Fernando Correa da Costa", numero: "600",  cidade: "Campo Grande", estado: "MS", cep: "79050-000", latitude: -20.4720, longitude: -54.6300 },
  # Zona sul
  { rua: "Rua Antônio Maria Coelho",     numero: "3000", cidade: "Campo Grande", estado: "MS", cep: "79002-000", latitude: -20.5050, longitude: -54.6130 },
  { rua: "Av. Três Barras",             numero: "210",  cidade: "Campo Grande", estado: "MS", cep: "79118-010", latitude: -20.5120, longitude: -54.6200 },
  # Zona leste
  { rua: "Av. Eduardo Elias Zahran",     numero: "1800", cidade: "Campo Grande", estado: "MS", cep: "79110-100", latitude: -20.4780, longitude: -54.5900 },
  { rua: "Rua Ceará",                   numero: "87",   cidade: "Campo Grande", estado: "MS", cep: "79005-500", latitude: -20.4700, longitude: -54.5950 },
  # Zona oeste
  { rua: "Av. Duque de Caxias",         numero: "900",  cidade: "Campo Grande", estado: "MS", cep: "79010-400", latitude: -20.4760, longitude: -54.6500 },
  { rua: "Rua Porto Alegre",            numero: "450",  cidade: "Campo Grande", estado: "MS", cep: "79010-600", latitude: -20.4690, longitude: -54.6450 },
  { rua: "Av. Calógeras",              numero: "3200", cidade: "Campo Grande", estado: "MS", cep: "79002-900", latitude: -20.4820, longitude: -54.6400 }
]

addresses.each { |a| Address.find_or_create_by!(rua: a[:rua], numero: a[:numero]) { |addr| addr.assign_attributes(a) } }

puts "Seeds concluídos! Veículos: #{Vehicle.count} | Motoristas: #{Driver.count} | Endereços: #{Address.count}"
