Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :enderecos, controller: :addresses do
        collection do
          patch :batch_update
        end
      end
      resources :veiculos, controller: :vehicles
      resources :motoristas, controller: :drivers
    end
  end

  get "/health", to: proc { [200, {}, [{ status: "ok" }.to_json]] }
end
