FROM ruby:3.2.2-slim

RUN apt-get update -qq && apt-get install -y \
  build-essential \
  libpq-dev \
  nodejs \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Gemfile Gemfile.lock* ./
RUN bundle install --jobs 4 --retry 3

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["./entrypoint.sh"]
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
