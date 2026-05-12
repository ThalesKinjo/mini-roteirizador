module Api
  module V1
    class DriversController < ApplicationController
      before_action :set_driver, only: %i[show update destroy]

      def index
        render json: Driver.all
      end

      def show
        render json: @driver
      end

      def create
        driver = Driver.create!(driver_params)
        render json: driver, status: :created
      end

      def update
        @driver.update!(driver_params)
        render json: @driver
      end

      def destroy
        @driver.destroy!
        head :no_content
      end

      private

      def set_driver
        @driver = Driver.find(params[:id])
      end

      def driver_params
        params.require(:motorista).permit(:nome, :cpf)
      end
    end
  end
end
