import { JSDOM } from 'jsdom'
import urls from 'src/assets/urls'
import ArrayToCsv from 'objects-to-csv'
import { Timeout } from '@nestjs/schedule'
import { HttpService, Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  @Timeout(0)
  async start() {
    const apps = []
    let iteration = 0
    for (const url of urls) {
      try {
        iteration++
        console.log(`${iteration}: ${url}`)
        const app: Record<string, any> = {}
        const { data } = await this.httpService.get(url).toPromise()
        const document = new JSDOM(data).window.document
        const supportListItems = Array.from(document.querySelectorAll('.app-support-list__item span'))
        app.url = url
        app.email = supportListItems[supportListItems.length - 2].textContent.trim()
        app.categories = Array.from(document.querySelectorAll('.heading--5.ui-app-store-hero__kicker a'))
          .map((item) => item.textContent)
          .join(',')
        app.image = document.querySelector('.ui-app-store-hero__app-icon img').getAttribute('src')
        app.description = document.querySelector('.heading--3.ui-app-store-hero__description').textContent
        app.name = document.querySelector('.heading--2.ui-app-store-hero__header__app-name').textContent
        app.partner = document.querySelector('.heading-4.ui-app-store-hero__header__subscript').textContent.slice(3)
        app.reviewCount = parseInt(
          document.querySelector('.ui-review-count-summary a')?.textContent.replace(/\D/g, '') || '0'
        )
        apps.push(app)
        this.saveToFile(apps)
      } catch (err) {
        console.log(err)
        continue
      }
    }
  }

  saveToFile(array: any[]) {
    new ArrayToCsv(array).toDisk(`${__dirname}/../output/apps.csv`)
  }
}
