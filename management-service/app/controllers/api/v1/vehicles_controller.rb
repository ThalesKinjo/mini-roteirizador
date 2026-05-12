module Api
  module V1
    class VehiclesController < ApplicationController
      before_action :set_vehicle, only: %i[show update destroy]

      def index
        vehicles = Vehicle.includes(:addresses).all
        render json: vehicles.as_json(include: { addresses: { only: %i[id rua numero cidade status] } })
      end

      def show
        render json: @vehicle.as_json(include: { addresses: { only: %i[id rua numero cidade status] } })
      end

      def create
        vehicle = Vehicle.create!(vehicle_params)
        render json: vehicle, status: :created
      end

      def update
        @vehicle.update!(vehicle_params)
        render json: @vehicle
      end

      def destroy
        @vehicle.destroy!
        head :no_content
      end

      private

      def set_vehicle
        @vehicle = Vehicle.find(params[:id])
      end

      def vehicle_params
        params.require(:veiculo).permit(:placa, :capacidade, :modelo)
      end
    end
  end
end
