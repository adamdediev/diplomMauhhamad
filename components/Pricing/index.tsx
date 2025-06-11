"use client";
import Image from "next/image";
import SectionHeader from "../Common/SectionHeader";

const Pricing = () => {
  return (
    <>
      {/* <!-- ===== Pricing Table Start ===== --> */}
      <section className="overflow-hidden pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          {/* <!-- Section Title Start --> */}
          <div className="animate_top mx-auto text-center">
            <SectionHeader
              headerInfo={{
                title: `Цены`,
                subtitle: `Выгодный экспорт для каждого`,
                description: ` Качественные продукты для успешного дела.`,
              }}
            />
          </div>
          {/* <!-- Section Title End --> */}
        </div>

        <div className="relative mx-auto mt-15 max-w-[1207px] px-4 md:px-8 xl:mt-20 xl:px-0">
          <div className="absolute -bottom-15 -z-1 h-full w-full">
            <Image
              fill
              src="./images/shape/shape-dotted-light.svg"
              alt="Dotted"
              className="dark:hidden"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-7.5 lg:flex-nowrap xl:gap-12.5">
            {/* <!-- Pricing Item --> */}
            <div className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none md:w-[45%] lg:w-1/3 xl:p-12.5">
              <h3 className="mb-7.5 text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
                15000Р
               
              </h3>
              <h4 className="mb-2.5 text-para2 font-medium text-black dark:text-white">
               Горох
              </h4>
              <p>Предлагаем отборный горох напрямую от производителя. Высокое качество, оптимальная цена, быстрая доставка. Горох — это вкус и польза для наших клиентов.</p>

              <div className="mt-9 border-t border-stroke pb-12.5 pt-9 dark:border-strokedark">
                <ul>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">
                    Экспорт до 300 тонн в год
                  </li>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">
                    консультационная поддержка
                  </li>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">
                    Стандартная документация
                  </li>
                 
                </ul>
              </div>

    
            </div>

            {/* <!-- Pricing Item --> */}
            <div className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none md:w-[45%] lg:w-1/3 xl:p-12.5">
             

              <h3 className="mb-7.5 text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
                11300Р
             
              </h3>
              <h4 className="mb-2.5 text-para2 font-medium text-black dark:text-white">
               Пшеница
              </h4>
              <p>Поставляем качественную пшеницу для мукомольных предприятий, пекарен и других производителей. Гарантируем высокое содержание клейковины, соответствие ГОСТ и своевременную доставку.</p>

              <div className="mt-9 border-t border-stroke pb-12.5 pt-9 dark:border-strokedark">
                <ul>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">
              Экспорт до 1500 тонн в год
                  </li>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">
                   консультационная поддержка
                  </li>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">
                  Стандартная документация
                  </li>
                 
                </ul>
              </div>

            
            </div>

            {/* <!-- Pricing Item --> */}
            <div className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none md:w-[45%] lg:w-1/3 xl:p-12.5">
              <h3 className="mb-7.5 text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
               20000Р
                
              </h3>
              <h4 className="mb-2.5 text-para2 font-medium text-black dark:text-white">
               Подсолнечник
              </h4>
              <p>Реализуем подсолнечник для масложировых предприятий. Высокое содержание масла, минимальное количество сора, выгодные условия сотрудничества. Качество, подтвержденное сертификатами, и стабильные поставки.</p>

              <div className="mt-4 border-t border-stroke pb-12.5 pt-9 dark:border-strokedark">
                <ul >
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">
                    Неограниченный объем экспорта
                  </li>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">
                  консультационная поддержка
                  </li>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">
                  Стандартная документация
                  </li>
                 
                </ul>
              </div>

            
            </div>
          </div>
        </div>
      </section>
      {/* <!-- ===== Pricing Table End ===== --> */}
    </>
  );
};

export default Pricing;
