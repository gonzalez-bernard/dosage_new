import sys

sys.path.append("/home/speedy/developpement/javascript")

from src.dosage.Dosage import Solution

e1 = Solution(1,0.1,[4.75])
e2 = Solution(2,0.05)
#especes = [{'type':1, 'c':0.1, 'pK':[4.75]},{'type':2, 'c':0.05, 'pK':[]}]

pH = Solution.calc_pH([e1,e2],0.000001)
print(pH)
#titrant = {'type':2, 'concentration':0.1}
#x, y = dosage(especes, titrant, 10, 20)
#plt.plot(x,y)
#plt.show()
