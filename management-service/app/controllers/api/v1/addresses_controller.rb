module Api
  module V1
    class AddressesController < ApplicationController
      before_action :set_address, only: %i[show update destroy]

      def index
        addresses = Address.includes(:vehicle).all
        render json: addresses.as_json(include: { vehicle: { only: %i[id placa modelo] } })
      end

      def show
        render json: @address.as_json(include: { vehicle: { only: %i[id placa modelo] } })
      end

      def create
        address = Address.create!(address_params)
        render json: address, status: :created
      end

      def update
        @address.update!(address_params)
        render json: @address
      end

      def destroy
        @address.destroy!
        head :no_content
      end

      def batch_update
        addresses_params = params.require(:addresses)

        ActiveRecord::Base.transaction do
          addresses_params.each do |addr|
            address = Address.find(addr[:id])
            address.update!(
              status: addr[:status],
              vehicle_id: addr[:veiculo_id]
            )
          end
        end

        render json: { message: "Endereços atualizados com sucesso" }
      rescue ActiveRecord::RecordNotFound => e
        render json: { error: e.message }, status: :not_found
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      private

      def set_address
        @address = Address.find(params[:id])
      end

      def address_params
        permitted = params.require(:endereco).permit(:rua, :numero, :cidade, :estado, :cep,
                                                     :latitude, :longitude, :status, :veiculo_id)
        permitted[:vehicle_id] = permitted.delete(:veiculo_id) if permitted.key?(:veiculo_id)
        permitted
      end
    end
  end
end
